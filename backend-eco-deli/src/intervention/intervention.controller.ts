import { Controller, Post, Body, Put, Param, Get, Patch } from '@nestjs/common';
import { InterventionService } from './intervention.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { ParseIntPipe } from '@nestjs/common';


@Controller('intervention')
export class InterventionController {
  constructor(private readonly interventionService: InterventionService) {}

  @Post()
  create(@Body() dto: CreateInterventionDto) {
    return this.interventionService.create(dto);
  }

  @Get('prestataire/:id')
  findByPrestataire(@Param('id') id: string) {
    return this.interventionService.findByPrestataire(Number(id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const intervention = await this.interventionService.findOneById(+id);
    return {
      ...intervention,
      prix: Number(intervention.prix), // transformation ici
    };
  }

  

  @Patch(':id/force-false')
  forceIsValidatedFalse(@Param('id') id: string) {
    return this.interventionService.forceIsValidatedFalse(Number(id));
  }

  @Get()
  findAll() {
    return this.interventionService.findAll(); // 👈 appelle bien cette méthode
  }



  @Patch(':id/paid') // ✅ PATCH & nom cohérent
  markAsPaid(@Param('id') id: string) {
    return this.interventionService.markAsPaid(Number(id));
  }

  @Patch(':id/validate')
  async validateTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.interventionService.validateClientTransfer(id);
  }



  @Get('client/:id')
  findByClient(@Param('id') id: string) {
    return this.interventionService.findByClient(Number(id));
  }

  @Put(':id/statut')
  updateStatut(@Param('id') id: string, @Body('statut') statut: string) {
    return this.interventionService.updateStatut(parseInt(id), statut as 'accepte' | 'refuse' | 'negociation');
  }

}
