import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getDashboard(@Request() req) {
    const userStatus = req.user.userStatus; 

    switch (userStatus) {
      case 'admin':
        return { message: 'Bienvenue sur le tableau de bord administrateur', dashboard: 'admin' };
      case 'client':
        return { message: 'Bienvenue sur votre espace client', dashboard: 'client' };
      case 'livreur':
        return { message: 'Bienvenue sur votre interface de livreur', dashboard: 'livreur' };
      case 'prestataire':
        return { message: 'Bienvenue sur votre tableau de bord prestataire', dashboard: 'prestataire' };
      case 'commercant':
        return { message: 'Bienvenue sur votre tableau de bord prestataire', dashboard: 'shopkeeper' };
      default:
        return { message: 'Accès interdit', error: 'NOT_FOUND' };
    }
  }
}
