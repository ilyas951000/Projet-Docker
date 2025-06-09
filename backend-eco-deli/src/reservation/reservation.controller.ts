import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  createReservation(
    @Body() body: {
      boxId: number;
      userId: number;
      startDate: string;
      endDate: string;
      packageId?: number;
    }
  ): Promise<Reservation> {
    const { boxId, userId, startDate, endDate, packageId } = body;
    return this.reservationService.create(boxId, userId, startDate, endDate, packageId);
  }

  @Get('admin/all')
  getAllReservations(): Promise<Reservation[]> {
    return this.reservationService.findAll();
  }

  @Get('admin/by-local/:localId')
  getReservationsByLocal(@Param('localId') localId: number): Promise<Reservation[]> {
    return this.reservationService.findByLocal(localId);
  }

  @Post('admin/:id/delete')
  deleteReservationByAdmin(@Param('id') id: number): Promise<void> {
    return this.reservationService.adminDeleteReservation(id);
  }

  @Post('admin/:id/cancel')
  cancelByAdmin(@Param('id') id: number): Promise<void> {
    return this.reservationService.cancelByAdmin(id);
  }


  @Get('user/:userId')
  getUserReservations(@Param('userId') userId: number): Promise<Reservation[]> {
    return this.reservationService.findByUser(userId);
  }

  @Post(':id/cancel')
  cancelReservation(
    @Param('id') reservationId: number,
    @Body() body: { userId: number }
  ): Promise<void> {
    return this.reservationService.cancel(reservationId, body.userId);
  }
}
