import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movement } from './entities/movement.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateMovementDto } from './dto/create-movement.dto';
import { geocodeAddress } from 'src/common/geocoding.util'; // Ce util doit exister ou être créé

@Injectable()
export class MovementsService {
  constructor(
    @InjectRepository(Movement)
    private readonly movementRepo: Repository<Movement>, // ✅ nom cohérent

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Crée un nouveau mouvement avec adresses et coordonnées GPS
   */
  async create(dto: CreateMovementDto): Promise<Movement> {
    const user = await this.userRepo.findOneBy({ id: dto.userId });
    if (!user) {
      throw new NotFoundException(`Utilisateur #${dto.userId} introuvable`);
    }

    const originFull = `${dto.originStreet}, ${dto.originPostalCode} ${dto.originCity}`;
    const destFull = `${dto.destinationStreet}, ${dto.destinationPostalCode} ${dto.destinationCity}`;

    const originCoords = await geocodeAddress(originFull);
    const destCoords = await geocodeAddress(destFull);

    const movement = this.movementRepo.create({
      userId: dto.userId,

      originStreet: dto.originStreet,
      originCity: dto.originCity,
      originPostalCode: dto.originPostalCode,
      originLatitude: originCoords.lat,
      originLongitude: originCoords.lng,

      destinationStreet: dto.destinationStreet,
      destinationCity: dto.destinationCity,
      destinationPostalCode: dto.destinationPostalCode,
      destinationLatitude: destCoords.lat,
      destinationLongitude: destCoords.lng,

      availableOn: dto.availableOn ? new Date(dto.availableOn) : undefined,
      note: dto.note,
      active: true,
    });

    return this.movementRepo.save(movement);
  }

  async findAll(): Promise<Movement[]> {
    return this.movementRepo.find();
  }



  /**
   * Récupère tous les mouvements actifs d’un utilisateur
   */
  async findByUser(userId: number): Promise<Movement[]> {
    return this.movementRepo.find({
      where: { userId, active: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Récupère un mouvement actif pour un livreur
   */
  async findActiveByUserId(userId: number): Promise<Movement | null> {
    return this.movementRepo.findOne({
      where: { userId, active: true },
    });
  }

  /**
   * Désactive un mouvement (soft delete)
   */
  async deactivate(id: number): Promise<void> {
    const existing = await this.movementRepo.findOneBy({ id });
    if (!existing) {
      throw new NotFoundException(`Mouvement #${id} introuvable`);
    }
    await this.movementRepo.update(id, { active: false });
  }
}
