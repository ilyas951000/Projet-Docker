import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { Box } from 'src/box/entities/box.entity';
import { User } from 'src/users/entities/user.entity';
import { Package } from 'src/packages/entities/package.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,

    @InjectRepository(Box)
    private boxRepo: Repository<Box>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Package)
    private packageRepo: Repository<Package>,
  ) {}

  async create(
    boxId: number,
    userId: number,
    startDate: string,
    endDate: string,
    packageId?: number,
  ): Promise<Reservation> {
    const box = await this.boxRepo.findOneBy({ id: boxId });
    if (!box) throw new NotFoundException('Box not found');

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const start = new Date(startDate);
    const end = new Date(endDate);

    if ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) > 10) {
      throw new BadRequestException('La durée maximale de réservation est de 10 jours.');
    }

    const conflict = await this.reservationRepo.findOne({
      where: {
        box: { id: boxId },
        startDate: LessThanOrEqual(end),
        endDate: MoreThanOrEqual(start),
      },
    });

    if (conflict) {
      throw new BadRequestException('Cette box est déjà réservée sur cette période.');
    }

    let selectedPackage: Package | null = null;

    if (packageId) {
      selectedPackage = await this.packageRepo.findOneBy({ id: packageId });
      if (!selectedPackage) throw new NotFoundException('Colis non trouvé');

      const existingReservation = await this.reservationRepo.findOneBy({ package: { id: packageId } });
      if (existingReservation) {
        throw new BadRequestException('Ce colis est déjà lié à une réservation.');
      }
    }

    const reservation = this.reservationRepo.create({
      box,
      client: user,
      startDate: start,
      endDate: end,
      ...(selectedPackage ? { package: selectedPackage } : {}),
    });


    return this.reservationRepo.save(reservation);
  }

  async cancelByAdmin(reservationId: number): Promise<void> {
    const reservation = await this.reservationRepo.findOneBy({ id: reservationId });
    if (!reservation) throw new NotFoundException('Réservation non trouvée');
    await this.reservationRepo.remove(reservation);
  }


  // Récupérer toutes les réservations
  async findAll(): Promise<Reservation[]> {
    return this.reservationRepo.find({
      relations: ['box', 'box.local', 'client', 'package'],
      order: { startDate: 'DESC' },
    });
  }

  // Récupérer les réservations par local
  async findByLocal(localId: number): Promise<Reservation[]> {
    return this.reservationRepo.find({
      where: { box: { local: { id: localId } } },
      relations: ['box', 'box.local', 'client', 'package'],
      order: { startDate: 'DESC' },
    });
  }

  // Suppression admin
  async adminDeleteReservation(reservationId: number): Promise<void> {
    const reservation = await this.reservationRepo.findOneBy({ id: reservationId });
    if (!reservation) throw new NotFoundException('Réservation non trouvée');
    await this.reservationRepo.remove(reservation);
  }


  async findByUser(userId: number): Promise<Reservation[]> {
    return this.reservationRepo.find({
      where: { client: { id: userId } },
      relations: ['box', 'box.local', 'package'],
      order: { startDate: 'DESC' },
    });
  }

  async cancel(reservationId: number, userId: number): Promise<void> {
    const reservation = await this.reservationRepo.findOne({
      where: { id: reservationId },
      relations: ['client'],
    });

    if (!reservation) throw new NotFoundException('Réservation non trouvée');

    if (reservation.client.id !== userId) {
      throw new BadRequestException("Vous ne pouvez pas annuler cette réservation.");
    }

    if (reservation.startDate <= new Date()) {
      throw new BadRequestException("Impossible d'annuler une réservation en cours ou passée.");
    }

    await this.reservationRepo.remove(reservation);
  }
}
