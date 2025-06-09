import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: '5115231248',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      userLastName: payload.userLastName,
      userFirstName: payload.userFirstName,
      email: payload.email,
      userStatus: payload.userStatus, 
      occasionalCourier: payload.occasionalCourier, 
      valid: payload.valid,
      userSubscription: payload.userSubscription,
      prestataireRoleId: payload.prestataireRoleId,
    };
  }
}
