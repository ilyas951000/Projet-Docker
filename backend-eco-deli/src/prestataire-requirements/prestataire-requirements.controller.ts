import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrestataireRequirementsService } from './prestataire-requirements.service';
import { CreatePrestataireRequirementDto } from './dto/create-prestataire-requirement.dto';
import { UpdatePrestataireRequirementDto } from './dto/update-prestataire-requirement.dto';

@Controller('prestataire-requirements')
export class PrestataireRequirementsController {
  constructor(private readonly prestataireRequirementsService: PrestataireRequirementsService) {}

  @Post()
  create(@Body() createPrestataireRequirementDto: CreatePrestataireRequirementDto) {
    return this.prestataireRequirementsService.create(createPrestataireRequirementDto);
  }

  @Get()
  findAll() {
    return this.prestataireRequirementsService.findAll();
  }
  @Get('by-role/:roleId')
  findByRole(@Param('roleId') roleId: string) {
    return this.prestataireRequirementsService.findByRole(+roleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prestataireRequirementsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrestataireRequirementDto: UpdatePrestataireRequirementDto) {
    return this.prestataireRequirementsService.update(+id, updatePrestataireRequirementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prestataireRequirementsService.remove(+id);
  }

  

}
