import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovementsController } from './movements.controller';
import { MovementsService } from './movements.service';
import { Movement } from './entities/movement.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movement, User])],
  controllers: [MovementsController],
  providers: [MovementsService],
})
export class MovementsModule {}
