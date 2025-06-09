import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Intervention } from './entities/intervention.entity';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { Transfer } from '../payments/entities/transfer.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class InterventionService {
  constructor(
    @InjectRepository(Intervention)
    private readonly interventionRepo: Repository<Intervention>,

    @InjectRepository(Transfer)
    private readonly transferRepo: Repository<Transfer>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateInterventionDto): Promise<Intervention> {
    const intervention = this.interventionRepo.create({
      ...dto,
      statut: 'en_attente',
      date: new Date(),
    });

    return this.interventionRepo.save(intervention);
  }

  async findAll() {
      return this.interventionRepo.find({
    relations: ['client', 'prestataire'],
  });
  }


  async findByPrestataire(prestataireId: number): Promise<Intervention[]> {
    return this.interventionRepo.find({
      where: { prestataireId },
      order: { createdAt: 'DESC' },
      relations: ['transfer'],
    });
  }

  async findByClient(clientId: number): Promise<Intervention[]> {
    return this.interventionRepo.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
      relations: ['transfer'],
    });
  }

  async updateStatut(id: number, statut: 'accepte' | 'refuse' | 'negociation') {
    const intervention = await this.interventionRepo.findOne({
      where: { id },
      relations: ['transfer'],
    });

    if (!intervention) {
      throw new NotFoundException('Intervention introuvable');
    }

    intervention.statut = statut;
    return this.interventionRepo.save(intervention);
  }

  async findOneById(id: number): Promise<Intervention> {
    const intervention = await this.interventionRepo.findOne({
      where: { id },
      relations: ['transfer'],
    });

    if (!intervention) {
      throw new NotFoundException('Intervention introuvable');
    }

    return intervention;
  }

  async forceIsValidatedFalse(interventionId: number) {
    const intervention = await this.interventionRepo.findOne({
      where: { id: interventionId },
      relations: ['transfer'],
    });

    if (!intervention?.transfer) {
      throw new Error('Transfert non trouvé');
    }

    await this.transferRepo.update(intervention.transfer.id, {
      isValidatedByClient: false,
    });

    return { success: true };
  }

  async validateClientTransfer(interventionId: number) {
    const intervention = await this.interventionRepo.findOne({
      where: { id: interventionId },
      relations: ['transfer'],
    });

    if (!intervention || !intervention.transfer) {
      throw new NotFoundException('Transfert non trouvé');
    }

    if (intervention.transfer.isValidatedByClient) {
      throw new Error('Déjà validé');
    }

    intervention.transfer.isValidatedByClient = true;
    return this.transferRepo.save(intervention.transfer);
  }

  async markAsPaid(interventionId: number) {
    const intervention = await this.interventionRepo.findOne({
      where: { id: interventionId },
      relations: ['transfer'],
    });

    if (!intervention) {
      throw new NotFoundException('Intervention introuvable');
    }

    if (intervention.transfer && intervention.transfer.status === 'completed') {
      return intervention;
    }

    const newTransfer = this.transferRepo.create({
      client: { id: intervention.clientId },
      provider: { id: intervention.prestataireId },
      amount: intervention.prix,
      status: 'pending', // ✅ Fix ici
      isValidatedByClient: false,
      requestedAt: new Date(),
    });

    const savedTransfer = await this.transferRepo.save(newTransfer);
    intervention.transfer = savedTransfer;
    await this.interventionRepo.save(intervention);

    return intervention;
  }

}
