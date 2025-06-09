import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacturableService } from './facturable.service';
import { CreateFacturableDto } from './dto/create-facturable.dto';
import { UpdateFacturableDto } from './dto/update-facturable.dto';

@Controller('facturable')
export class FacturableController {
  constructor(private readonly facturableService: FacturableService) {}

  @Post()
  create(@Body() createFacturableDto: CreateFacturableDto) {
    return this.facturableService.create(createFacturableDto);
  }

  @Get()
  findAll() {
    return this.facturableService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facturableService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacturableDto: UpdateFacturableDto) {
    return this.facturableService.update(+id, updateFacturableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facturableService.remove(+id);
  }
}
