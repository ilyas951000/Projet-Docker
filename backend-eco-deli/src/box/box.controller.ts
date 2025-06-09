import { Body, Controller, Get, Param, Patch, Post, Delete } from '@nestjs/common';
import { BoxService } from './box.service';
import { CreateBoxDto } from './dto/create-box.dto';
import { Box } from './entities/box.entity'; // <-- Ajout nécessaire

@Controller('boxes')
export class BoxController {
  constructor(private readonly boxService: BoxService) {}

  @Post()
  create(@Body() dto: CreateBoxDto) {
    return this.boxService.create(dto);
  }

  @Get()
  findAll() {
    return this.boxService.findAll();
  }

  @Get('/by-local/:localId')
  getBoxesByLocal(@Param('localId') localId: number) {
    return this.boxService.findByLocal(localId);
  }

  @Get('admin/all')
  getAllBoxesAdmin() {
    return this.boxService.findAllWithReservations();
  }

  @Patch('admin/:id')
  updateBox(@Param('id') id: number, @Body() dto: Partial<Box>) {
    return this.boxService.update(id, dto);
  }

  @Delete('admin/:id')
  deleteBox(@Param('id') id: number) {
    return this.boxService.delete(id);
  }
}
