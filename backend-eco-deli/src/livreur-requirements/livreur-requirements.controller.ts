import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { LivreurRequirementsService } from './livreur-requirements.service';

@Controller('livreur-requirements')
export class LivreurRequirementsController {
  constructor(private readonly service: LivreurRequirementsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body('name') name: string) {
    return this.service.create(name);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(+id);
  }
}
