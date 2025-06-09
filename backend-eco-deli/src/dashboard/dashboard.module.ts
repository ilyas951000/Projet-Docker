import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { AuthModule } from '../auth/auth.module'; // 👈 Import du module Auth

@Module({
  imports: [AuthModule], // 👈 Ajout de AuthModule ici
  controllers: [DashboardController],
})
export class DashboardModule {}
