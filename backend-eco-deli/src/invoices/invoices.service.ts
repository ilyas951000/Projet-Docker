import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { Invoice } from './entities/invoice.entity';
import { Transfer } from '../payments/entities/transfer.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

const PDFDocument = require('pdfkit');

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,

    @InjectRepository(Transfer)
    private transferRepository: Repository<Transfer>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    if (!createInvoiceDto.userId) {
      throw new Error('userId est requis pour créer une facture');
    }

    if (!createInvoiceDto.invoiceNumber || createInvoiceDto.invoiceNumber.trim() === '') {
      createInvoiceDto.invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }

    const invoice = this.invoicesRepository.create(createInvoiceDto);
    return this.invoicesRepository.save(invoice);
  }

  findAll() {
    return this.invoicesRepository.find();
  }

  findOne(id: number) {
    return this.invoicesRepository.findOneBy({ id });
  }

  update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesRepository.update(id, updateInvoiceDto);
  }

  remove(id: number) {
    return this.invoicesRepository.delete(id);
  }

  async getInvoiceHistoryByUser(
    userId: number,
    sortBy = 'issueDate',
    order: 'ASC' | 'DESC' = 'DESC',
    status?: 'paid' | 'unpaid',
    month?: number,
    year?: number,
  ) {
    const qb = this.invoicesRepository
      .createQueryBuilder('invoice')
      .where('invoice.userId = :userId', { userId });

    if (status === 'paid') qb.andWhere('invoice.paymentStatus = true');
    if (status === 'unpaid') qb.andWhere('invoice.paymentStatus = false');

    if (month && year) {
      qb.andWhere('EXTRACT(MONTH FROM invoice.issueDate) = :month', { month });
      qb.andWhere('EXTRACT(YEAR FROM invoice.issueDate) = :year', { year });
    }

    return qb.orderBy(`invoice.${sortBy}`, order).getMany();
  }

  async generateInvoicePdf(invoiceId: number, res: Response) {
    try {
      const invoice = await this.invoicesRepository.findOne({
        where: { id: invoiceId },
        relations: ['items'], // ✅ on retire 'user'
      });
  
      if (!invoice) {
        res.status(404).send('Facture introuvable');
        return;
      }
  
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=facture-${invoiceId}.pdf`);
      doc.pipe(res);
  
      doc.fontSize(16).text(`Facture #${invoice.invoiceNumber}`, { align: 'center' });
      doc.moveDown();
      doc.text(`Date : ${new Date(invoice.issueDate).toLocaleDateString()}`);
      doc.text(`Montant : ${invoice.totalAmount} €`);
      doc.text(`Statut : ${invoice.paymentStatus ? 'Payé' : 'Non payé'}`);
      doc.text(`Méthode de paiement : ${invoice.paymentMethod}`);
      doc.text(`Service : ${invoice.serviceTitle}`);
      doc.text(`Type d'utilisateur : ${invoice.userType}`);
      doc.text(`ID utilisateur : ${invoice.userId}`);
      doc.moveDown();
  
      if (invoice.items?.length) {
        doc.text('Détails :');
        invoice.items.forEach((item, i) => {
          doc.text(`${i + 1}. ${item.description} - ${item.amount} €`);
        });
      }
  
      doc.end();
    } catch (error) {
      console.error('Erreur génération PDF :', error);
      if (!res.headersSent) {
        res.status(500).send('Erreur serveur lors de la génération de la facture');
      }
    }
  }
  

  async createFromTransfer(transferId: number) {
    const transfer = await this.transferRepository.findOne({
      where: { id: transferId },
      relations: ['client', 'provider'],
    });

    if (!transfer || !transfer.client || !transfer.provider) {
      throw new NotFoundException('Transfert, client ou prestataire introuvable');
    }

    const clientInvoiceNumber = `INV-CL-${transfer.id}`;
    const providerInvoiceNumber = `INV-PR-${transfer.id}`;

    const existingClient = await this.invoicesRepository.findOne({ where: { invoiceNumber: clientInvoiceNumber } });
    const existingProvider = await this.invoicesRepository.findOne({ where: { invoiceNumber: providerInvoiceNumber } });

    const created: Invoice[] = [];

    if (!existingClient) {
      const clientInvoice = this.invoicesRepository.create({
        invoiceNumber: clientInvoiceNumber,
        issueDate: new Date(transfer.requestedAt),
        paymentDate: new Date(transfer.requestedAt),
        totalAmount: Number(transfer.amount).toFixed(2),
        paymentStatus: true,
        paymentMethod: 'in-app',
        serviceTitle: `Facture client pour transfert #${transfer.id}`,
        userType: 'client',
        userId: transfer.client.id,
      });
      await this.invoicesRepository.save(clientInvoice);
      created.push(clientInvoice);
    }

    if (!existingProvider) {
      const providerInvoice = this.invoicesRepository.create({
        invoiceNumber: providerInvoiceNumber,
        issueDate: new Date(transfer.requestedAt),
        paymentDate: new Date(transfer.requestedAt),
        totalAmount: Number(transfer.amount).toFixed(2),
        paymentStatus: true,
        paymentMethod: 'in-app',
        serviceTitle: `Facture prestataire pour transfert #${transfer.id}`,
        userType: 'prestataire',
        userId: transfer.provider.id,
      });
      await this.invoicesRepository.save(providerInvoice);
      created.push(providerInvoice);
    }

    return created;
  }

  async createMonthlyInvoiceForUser(userId: number, month: number, year: number) {
    const payments = await this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.client', 'client')
      .where('client.id = :userId', { userId })
      .andWhere('MONTH(transfer.requestedAt) = :month', { month })
      .andWhere('YEAR(transfer.requestedAt) = :year', { year })
      .andWhere('transfer.isValidatedByClient = true')
      .getMany();

    if (!payments.length) {
      throw new NotFoundException('Aucun paiement trouvé pour ce mois.');
    }

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const invoiceNumber = `INV-CL-MONTH-${year}${month}-${userId}`;

    const existing = await this.invoicesRepository.findOne({ where: { invoiceNumber } });
    if (existing) return existing;

    const invoice = this.invoicesRepository.create({
      invoiceNumber,
      issueDate: new Date(),
      paymentDate: new Date(),
      totalAmount: Number(total).toFixed(2),
      paymentStatus: true,
      paymentMethod: 'in-app',
      serviceTitle: `Facturation mensuelle client - ${month}/${year}`,
      userType: 'client',
      userId,
    });

    return this.invoicesRepository.save(invoice);
  }

  async createMonthlyInvoiceForProvider(userId: number, month: number, year: number) {
    const payments = await this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.provider', 'provider')
      .where('provider.id = :userId', { userId })
      .andWhere('MONTH(transfer.requestedAt) = :month', { month })
      .andWhere('YEAR(transfer.requestedAt) = :year', { year })
      .andWhere('transfer.isValidatedByClient = true')
      .getMany();

    if (!payments.length) {
      throw new NotFoundException('Aucun paiement prestataire trouvé pour ce mois.');
    }

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const invoiceNumber = `INV-PR-MONTH-${year}${month}-${userId}`;

    const existing = await this.invoicesRepository.findOne({ where: { invoiceNumber } });
    if (existing) return existing;

    const invoice = this.invoicesRepository.create({
      invoiceNumber,
      issueDate: new Date(),
      paymentDate: new Date(),
      totalAmount: Number(total).toFixed(2),
      paymentStatus: true,
      paymentMethod: 'in-app',
      serviceTitle: `Facturation mensuelle prestataire - ${month}/${year}`,
      userType: 'prestataire',
      userId,
    });

    return this.invoicesRepository.save(invoice);
  }

  async generateMonthlySummaryPdf(month: number, year: number, res: Response) {
    const invoices = await this.invoicesRepository
      .createQueryBuilder("invoice")
      .where('EXTRACT(MONTH FROM invoice.issueDate) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM invoice.issueDate) = :year', { year })
      .andWhere('invoice.invoiceNumber NOT LIKE :monthPattern', { monthPattern: 'INV-%-MONTH-%' })
      .orderBy('invoice.issueDate', 'ASC')
      .getMany();

    if (invoices.length === 0) {
      throw new NotFoundException('Aucune facture trouvée pour cette période.');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facturation-${month}-${year}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text(`🧾 Facturation mensuelle - ${month}/${year}`, { align: 'center' });
    doc.moveDown();

    let total = 0;

    invoices.forEach((inv, idx) => {
      doc.fontSize(12).text(`${idx + 1}. ${inv.invoiceNumber} - ${inv.serviceTitle}`);
      doc.text(`   Montant : ${inv.totalAmount} €`);
      doc.text(`   Statut : ${inv.paymentStatus ? 'Payé' : 'Non payé'}`);
      doc.text(`   Date : ${new Date(inv.issueDate).toLocaleDateString()}`);
      doc.moveDown(0.5);
      total += parseFloat(inv.totalAmount);
    });

    doc.moveDown();
    doc.fontSize(14).text(`💰 Total général : ${total.toFixed(2)} €`, { align: 'right' });
    doc.end();
  }

  async ensureProviderInvoicesExist(providerId: number) {
    const transfers = await this.transferRepository.find({
      where: {
        provider: { id: providerId },
        isValidatedByClient: true,
      },
      relations: ['client', 'provider'],
    });

    for (const transfer of transfers) {
      const invoiceNumber = `INV-PR-${transfer.id}`;

      const existing = await this.invoicesRepository.findOne({
        where: {
          userId: providerId,
          userType: 'prestataire',
          invoiceNumber,
        },
      });

      if (!existing) {
        const invoice = this.invoicesRepository.create({
          invoiceNumber,
          issueDate: new Date(transfer.requestedAt),
          paymentDate: new Date(transfer.requestedAt),
          totalAmount: Number(transfer.amount).toFixed(2),
          paymentStatus: true,
          paymentMethod: 'in-app',
          serviceTitle: `Facture prestataire pour transfert #${transfer.id}`,
          userType: 'prestataire',
          userId: providerId,
        });

        await this.invoicesRepository.save(invoice);
      }
    }
  }
}
