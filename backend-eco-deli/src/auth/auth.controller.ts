import { Controller, Post, Body, Get, UseGuards, Request, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    try {
      const user = await this.authService.register(registerUserDto);
      return {
        message: 'Utilisateur inscrit avec succès',
        user: { id: user.id, email: user.email, userStatus: user.userStatus },
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de l\'inscription');
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const { accessToken, userStatus } = await this.authService.login(loginUserDto);
      return {
        message: 'Connexion réussie',
        accessToken,
        userStatus,
      };
    } catch (error) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return {
      userId: req.user.sub,
      userLastName: req.user.userLastName,
      userFirstName: req.user.userFirstName,
      userStatus: req.user.userStatus,
      occasionalCourier: req.user.occasionalCourier,
      valid: req.user.valid,
      userSubscription: req.user.userSubscription,
      prestataireRoleId: req.user.prestataireRoleId,
    };
  }

}
