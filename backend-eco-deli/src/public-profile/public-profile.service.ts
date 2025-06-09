import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  In,
  Repository,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { startOfDay, endOfDay } from 'date-fns';

import { PublicProfile } from './entities/public-profile.entity';
import { CreatePublicProfileDto } from './dto/create-public-profile.dto';
import { UpdatePublicProfileDto } from './dto/update-public-profile.dto';
import { User } from '../users/entities/user.entity';
import { Schedule } from '../schedules/entities/schedule.entity';

@Injectable()
export class PublicProfileService {
  constructor(
    @InjectRepository(PublicProfile)
    private readonly publicProfileRepository: Repository<PublicProfile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  /**
   * Crée un nouveau profil public.
   */
  async create(userId: number, dto: CreatePublicProfileDto): Promise<PublicProfile> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);

    const profile = this.publicProfileRepository.create({
      ...dto,
      user,
    });

    return await this.publicProfileRepository.save(profile);
  }

  /**
   * Récupère les profils publics disponibles sur une plage de dates.
   */
  async findAvailable(start: Date, end: Date): Promise<PublicProfile[]> {
    const from = startOfDay(start);
    const to = endOfDay(end);

    console.log('🔍 Recherche de disponibilités entre', from.toISOString(), 'et', to.toISOString());

    const schedules = await this.scheduleRepository.find({
      where: {
        scheduleStart: LessThanOrEqual(to),
        scheduleEnd: MoreThanOrEqual(from),
      },
      relations: ['user'],
    });

    console.log(`📋 ${schedules.length} schedule(s) trouvés.`);

    schedules.forEach((s, i) => {
      console.log(`- Schedule ${i + 1}: start=${s.scheduleStart}, end=${s.scheduleEnd}, userIds=${s.user?.map(u => u.id)}`);
    });

    const userIds = schedules.flatMap(schedule =>
      Array.isArray(schedule.user) ? schedule.user.map(user => user.id) : []
    );

    const uniqueUserIds = [...new Set(userIds)];

    console.log('👤 Utilisateurs associés aux schedules :', uniqueUserIds);

    if (uniqueUserIds.length === 0) {
      console.log('❌ Aucun utilisateur avec des horaires disponibles.');
      return [];
    }

    const profiles = await this.publicProfileRepository.find({
      where: { user: { id: In(uniqueUserIds) } },
      relations: ['user'],
    });

    console.log(`✅ ${profiles.length} profil(s) public(s) retourné(s).`);

    return profiles;
  }

  /**
   * Tous les profils publics.
   */
  async findAll(): Promise<PublicProfile[]> {
    return this.publicProfileRepository.find({
      relations: ['user'],
    });
  }

  /**
   * Profils d’un utilisateur.
   */
  async findByUser(userId: number): Promise<PublicProfile[]> {
    return this.publicProfileRepository.find({
      where: { user: { id: userId } },
    });
  }

  /**
   * Mise à jour d’un profil.
   */
  async update(id: number, dto: UpdatePublicProfileDto): Promise<PublicProfile> {
    const profile = await this.publicProfileRepository.findOne({ where: { id } });
    if (!profile) throw new NotFoundException(`Profil avec l'ID ${id} non trouvé`);

    await this.publicProfileRepository.update(id, dto);
    return this.publicProfileRepository.findOneOrFail({ where: { id } });
  }

  /**
   * Suppression d’un profil.
   */
  async remove(id: number): Promise<void> {
    const profile = await this.publicProfileRepository.findOne({ where: { id } });
    if (!profile) throw new NotFoundException(`Profil avec l'ID ${id} non trouvé`);

    await this.publicProfileRepository.remove(profile);
  }
}
