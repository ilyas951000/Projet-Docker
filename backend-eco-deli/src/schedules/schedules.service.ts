// src/schedule/schedule.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findByCourier(courierId: number): Promise<Schedule[]> {
    this.logger.debug(`Récupération des schedules pour le courierId: ${courierId}`);
    // Utilisation de innerJoin pour obtenir uniquement les schedules qui ont bien une association avec le user
    const schedules = await this.scheduleRepo
      .createQueryBuilder('schedule')
      .innerJoin('schedule.user', 'user', 'user.id = :id', { id: courierId })
      .getMany();
    this.logger.debug(`Schedules récupérés: ${JSON.stringify(schedules)}`);
    return schedules;
  }

  async findAll(): Promise<Schedule[]> {
    return this.scheduleRepo.find({
      relations: ['user'],
      order: { scheduleStart: 'ASC' },
    });
  }


  async createForCourier(courierId: number, dto: Partial<Schedule>): Promise<Schedule> {
    this.logger.debug(`Création d'un nouveau schedule pour courierId: ${courierId} avec dto: ${JSON.stringify(dto)}`);
    const user = await this.userRepo.findOne({ where: { id: courierId } });
    if (!user) {
      this.logger.error(`User not found for id ${courierId}`);
      throw new NotFoundException(`User with id ${courierId} not found`);
    }

    const schedule = this.scheduleRepo.create(dto);
    // Pour la relation ManyToMany, on affecte un tableau d'utilisateurs.
    schedule.user = [user];
    this.logger.debug(`Schedule à sauvegarder: ${JSON.stringify(schedule)}`);
    const savedSchedule = await this.scheduleRepo.save(schedule);
    this.logger.debug(`Schedule créé avec succès: ${JSON.stringify(savedSchedule)}`);
    return savedSchedule;
  }

  async remove(id: number): Promise<void> {
    this.logger.debug(`Suppression du schedule avec id: ${id}`);
    const result = await this.scheduleRepo.delete(id);
    if (result.affected === 0) {
      this.logger.error(`Aucun schedule trouvé avec id: ${id}`);
      throw new NotFoundException(`Schedule with id ${id} not found`);
    }
    this.logger.debug(`Schedule avec id ${id} supprimé avec succès.`);
  }
}
