import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { PublicProfileService } from './public-profile.service';
import { CreatePublicProfileDto } from './dto/create-public-profile.dto';
import { UpdatePublicProfileDto } from './dto/update-public-profile.dto';

@Controller('public-profile')
export class PublicProfileController {
  constructor(private readonly publicProfileService: PublicProfileService) {}

  /**
   * Crée un nouveau profil public lié à un utilisateur.
   */
  @Post(':userId')
  create(
    @Param('userId') userId: string,
    @Body() dto: CreatePublicProfileDto
  ) {
    const numericId = parseInt(userId, 10);
    if (isNaN(numericId)) throw new NotFoundException('ID utilisateur invalide');
    return this.publicProfileService.create(numericId, dto);
  }

  /**
   * Récupère tous les profils publics disponibles entre deux dates.
   */
  @Get('available')
  findAvailable(
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    if (!start || !end) {
      throw new NotFoundException('Les paramètres start et end sont requis');
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new NotFoundException('Dates invalides');
    }

    return this.publicProfileService.findAvailable(startDate, endDate);
  }

  /**
   * Récupère tous les profils publics (sans filtre).
   */
  @Get()
  findAll() {
    return this.publicProfileService.findAll();
  }

  /**
   * Récupère tous les profils d’un utilisateur donné.
   */
  @Get(':userId')
  findByUser(@Param('userId') userId: string) {
    const numericId = parseInt(userId, 10);
    if (isNaN(numericId)) throw new NotFoundException('ID utilisateur invalide');
    return this.publicProfileService.findByUser(numericId);
  }

  /**
   * Met à jour un profil public existant.
   */
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePublicProfileDto
  ) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) throw new NotFoundException('ID de profil invalide');
    return this.publicProfileService.update(numericId, dto);
  }
}
