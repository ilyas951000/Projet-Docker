import { Module } from '@nestjs/common';
import { PrestataireRolesService } from './prestataire-roles.service';
import { PrestataireRolesController } from './prestataire-roles.controller';

@Module({
  controllers: [PrestataireRolesController],
  providers: [PrestataireRolesService],
})
export class PrestataireRolesModule {}
