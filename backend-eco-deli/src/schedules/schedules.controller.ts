// src/schedule/schedule.controller.ts
import { Controller, Get, Param, Post, Body, Delete, Logger } from '@nestjs/common';
import { ScheduleService } from './schedules.service';
import { Schedule } from './entities/schedule.entity';

@Controller('courier/:id/schedule')
export class ScheduleController {
  private readonly logger = new Logger(ScheduleController.name);
  
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getSchedules(@Param('id') courierId: number): Promise<Schedule[]> {
    this.logger.debug(`GET request pour récupérer les schedules du courier ${courierId}`);
    const schedules = await this.scheduleService.findByCourier(+courierId);
    this.logger.debug(`Schedules trouvés: ${JSON.stringify(schedules)}`);
    return schedules;
  }

  


  @Post()
  async createSchedule(
    @Param('id') courierId: number,
    @Body() body: Partial<Schedule>,
  ): Promise<Schedule> {
    this.logger.debug(`POST request pour créer un schedule pour le courier ${courierId} avec body: ${JSON.stringify(body)}`);
    return this.scheduleService.createForCourier(+courierId, body);
  }

  @Get('all')
  findAll() {
    return this.scheduleService.findAll();
  }


  @Delete(':scheduleId')
  async deleteSchedule(@Param('scheduleId') scheduleId: number): Promise<{ message: string }> {
    this.logger.debug(`DELETE request pour supprimer le schedule avec id ${scheduleId}`);
    await this.scheduleService.remove(+scheduleId);
    return { message: 'Schedule deleted successfully' };
  }
}
