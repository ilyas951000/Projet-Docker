import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token manquant ou invalide");
    }

    try {
      const token = authHeader.split(" ")[1];
      const decoded = this.jwtService.verify(token);
      
      // Vérifier si l'utilisateur a bien un `userStatus`
      if (!decoded.userStatus) {
        throw new ForbiddenException("Accès interdit : rôle non défini");
      }

      request.user = decoded; // Attache l'utilisateur à la requête
      return true;
    } catch (err) {
      throw new UnauthorizedException("Token invalide ou expiré");
    }
  }
}
