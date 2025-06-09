import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterventionService } from './intervention.service';
import { InterventionController } from './intervention.controller';
import { Intervention } from './entities/intervention.entity';
import { Advertisement } from '../advertisements/entities/advertisement.entity';
import { Transfer } from '../payments/entities/transfer.entity'; // ✅ ajoute ça
import { UsersModule } from '../users/users.module'; // ✅ adapte le chemin selon ton projet
import { User } from '../users/entities/user.entity'; // 👈 adapte le chemin si besoin

@Module({
  imports: [TypeOrmModule.forFeature([Intervention, Advertisement, Transfer, User]), UsersModule],
  controllers: [InterventionController],
  providers: [InterventionService],
})
export class InterventionModule {}
