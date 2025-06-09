// src/schedules/schedules.module.ts
import { Module } from '@nestjs/common';
import { ScheduleService } from './schedules.service'; // nom correct du fichier
import { ScheduleController } from './schedules.controller'; // nom correct du fichier
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, User])],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
