import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { Movement } from './entities/movement.entity';

@Controller('movements')
export class MovementsController {
  constructor(private readonly movementService: MovementsService) {}

  /**
   * Crée un nouveau mouvement
   * POST /movements
   */
  @Post()
  create(@Body() dto: CreateMovementDto): Promise<Movement> {
    return this.movementService.create(dto);
  }

  @Get()
  findAll(): Promise<Movement[]> {
    return this.movementService.findAll();
  }

  /**
   * Récupère les mouvements actifs d’un utilisateur
   * GET /movements/user/:userId
   */
  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<Movement[]> {
    return this.movementService.findByUser(userId);
  }

  /**
   * Récupère le mouvement actif d’un livreur
   * GET /movements/active?userId=42
   */
  @Get('/active')
  getActiveMovement(@Query('userId', ParseIntPipe) userId: number): Promise<Movement | null> {
    return this.movementService.findActiveByUserId(userId);
  }

  /**
   * Désactive un mouvement
   * PATCH /movements/:id/deactivate
   */
  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.movementService.deactivate(id);
  }
}
