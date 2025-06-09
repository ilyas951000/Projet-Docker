import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Transfer } from './entities/transfer.entity';
import { User } from 'src/users/entities/user.entity';
import { TransferHistory } from 'src/transfer-history/entities/transfer-history.entity';
import { PlatformFee } from './entities/platform-fee.entity'; // 👈 Assure-toi de l'importer
import { Subscription } from 'src/subscriptions/entities/subscription.entity';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>,

    @InjectRepository(Transfer)
    private transferRepo: Repository<Transfer>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(TransferHistory)
    private readonly transferHistoryRepo: Repository<TransferHistory>,

    @InjectRepository(PlatformFee) // 👈 Ajout à faire ici
    private readonly platformFeeRepo: Repository<PlatformFee>, // 👈 Ajout à faire ici

    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  // ✅ Fonction manquante ajoutée ici
  private getMaxRefundAmount(subscription?: number): number {
    switch (subscription) {
      case 1:
        return 115; // Starter
      case 2:
        return 3000; // Premium
      default:
        return 0; // Free
    }
  }

  // Exemple dans transfer.service.ts ou un service dédié
async getTotalRevenue(): Promise<number> {
  const totalTransfers = await this.transferRepo
    .createQueryBuilder('transfer')
    .select('SUM(transfer.amount)', 'total')
    .getRawOne();

  const totalFees = await this.platformFeeRepo
    .createQueryBuilder('fee')
    .select('SUM(fee.amount)', 'total')
    .getRawOne();

  const subscriptions = await this.subscriptionRepo.find();
  const subscriptionRevenue = subscriptions.reduce((sum, sub) => {
    if (sub.subscriptionTitle === 'Premium') return sum + 19.99;
    if (sub.subscriptionTitle === 'Starter') return sum + 9.99;
    return sum;
  }, 0);

  const transfersAmount = parseFloat(totalTransfers.total) || 0;
  const feesAmount = parseFloat(totalFees.total) || 0;

  return transfersAmount + feesAmount + subscriptionRevenue;
}

async getTotalTransfersAmount(): Promise<number> {
  const result = await this.transferRepo
    .createQueryBuilder('transfer')
    .select('SUM(transfer.amount)', 'total')
    .getRawOne();

  return parseFloat(result.total) || 0;
}




  async getBalance(providerId: number): Promise<{ balance: number }> {
    const transfers = await this.transferRepo.find({
      where: { provider: { id: providerId } },
    });

    const earned = transfers
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const withdrawn = transfers
      .filter((t) => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    return { balance: earned - withdrawn };
  }

async refundClient(
    adminId: number,
    providerId: number,
    amount: number,
  ): Promise<Transfer> {
    if (amount <= 0) {
      throw new BadRequestException('Montant invalide');
    }

    // 🔍 On récupère l'admin (utilisateur connecté) et le livreur (destinataire du remboursement)
    const admin = await this.userRepo.findOneBy({ id: adminId });
    const provider = await this.userRepo.findOneBy({ id: providerId });

    if (!admin) {
      console.error(`❌ Admin avec l'ID ${adminId} introuvable`);
      throw new NotFoundException('Admin introuvable');
    }

    if (!provider) {
      console.error(`❌ Livreur avec l'ID ${providerId} introuvable`);
      throw new NotFoundException('Livreur introuvable');
    }

    // ✅ Plafond basé sur l'abonnement du livreur
    const max = this.getMaxRefundAmount(provider.userSubscription);
    if (amount > max) {
      throw new BadRequestException(`Le montant dépasse le plafond autorisé (${max} €)`);
    }

    // ✅ On crée un transfert direct du client (admin) vers le livreur (prestataire)
    const transfer = this.transferRepo.create({
      provider,            // → Livreur = bénéficiaire
      client: admin,       // → Admin = initiateur du remboursement
      amount,
      status: 'completed',
      isValidatedByClient: true,
      requestedAt: new Date(),
      packageId: null,     // 💡 optionnel ici, sauf si tu veux associer un colis
    });

    console.log(`💸 Remboursement de ${amount}€ de l'admin #${admin.id} vers le livreur #${provider.id}`);

    return this.transferRepo.save(transfer);
  }




  async requestTransfer(
    providerId: number,
    amount: number,
  ): Promise<Transfer> {
    if (amount <= 0) throw new BadRequestException('Montant invalide');
    const { balance } = await this.getBalance(providerId);
    if (amount > balance) throw new BadRequestException('Solde insuffisant');

    const provider = await this.userRepo.findOneBy({ id: providerId });
    if (!provider) throw new NotFoundException('Prestataire introuvable');

    const transfer = this.transferRepo.create({
      provider,
      amount,
      status: 'pending',
    });

    return this.transferRepo.save(transfer);
  }

  async distributePayment(
    packageId: number,
    totalAmount: number,
    clientUserId: number,
  ) {
    const segments = await this.transferHistoryRepo.find({
      where: { packageId },
      order: { transferDate: 'ASC' },
    });

    if (segments.length === 0) {
      console.log('Aucun transfert - pas de distribution');
      return;
    }

    const client = await this.userRepo.findOneBy({ id: clientUserId });
    if (!client) throw new NotFoundException('Client introuvable');

    console.log('--- DÉBUT DISTRIBUTION ---');
    console.log('TotalAmount:', totalAmount);
    console.log('Segments:', segments);

    await this.transferRepo.delete({ packageId });

    const transfersToInsert: Transfer[] = [];

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];

      if (seg.fromCourierId && seg.livreur1Progress) {
        const provider = await this.userRepo.findOneBy({
          id: seg.fromCourierId,
        });
        if (provider) {
          const amount = Math.round(
            (seg.livreur1Progress / 100) * totalAmount,
          );

          transfersToInsert.push(
            this.transferRepo.create({
              provider,
              client,
              amount,
              status: 'completed',
              isValidatedByClient: true,
              requestedAt: new Date(),
              packageId,
            }),
          );

          console.log(
            `→ Livreur ${seg.fromCourierId} reçoit ${amount}€ (progress: ${seg.livreur1Progress}%)`,
          );
        }
      }

      const isLast = i === segments.length - 1;
      if (isLast && seg.toCourierId && seg.livreur2Progress) {
        const lastProvider = await this.userRepo.findOneBy({
          id: seg.toCourierId,
        });
        if (lastProvider) {
          const amount = Math.round(
            (seg.livreur2Progress / 100) * totalAmount,
          );

          transfersToInsert.push(
            this.transferRepo.create({
              provider: lastProvider,
              client,
              amount,
              status: 'pending',
              isValidatedByClient: false,
              requestedAt: new Date(),
              packageId,
            }),
          );

          console.log(
            `→ Livreur final ${seg.toCourierId} reçoit ${amount}€ (progress: ${seg.livreur2Progress}%)`,
          );
        }
      }
    }

    console.log('--- FIN DISTRIBUTION ---');
    return this.transferRepo.save(transfersToInsert);
  }
}
