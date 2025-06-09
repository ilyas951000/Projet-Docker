import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { VirementService } from './virement.service';

@Controller('virements')
export class VirementController {
  constructor(private readonly virementService: VirementService) {}

  @Get()
  findAll() {
    return this.virementService.findAll();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'accepte' | 'refuse'
  ) {
    return this.virementService.updateStatus(+id, status);
  }
}
