import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { LocalService } from './local.service';
import { CreateLocalDto } from './dto/create-local.dto';

@Controller('locals')
export class LocalController {
  constructor(private readonly localService: LocalService) {}

  @Post()
  create(@Body() dto: CreateLocalDto) {
    return this.localService.create(dto);
  }

  @Get()
  findAll() {
    return this.localService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.localService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateLocalDto) {
    return this.localService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.localService.remove(+id);
  }
}