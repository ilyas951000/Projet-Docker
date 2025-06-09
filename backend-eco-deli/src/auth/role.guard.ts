import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = 'admin';
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new UnauthorizedException('Token manquant');

    const token = authHeader.split(' ')[1];
    const decodedToken = this.jwtService.verify(token);

    if (decodedToken.userStatus !== requiredRole) {
      throw new UnauthorizedException('Accès refusé');
    }

    return true;
  }
}
