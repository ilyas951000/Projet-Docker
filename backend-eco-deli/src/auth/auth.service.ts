import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/entities/user.entity";
import { RegisterUserDto } from "../users/dto/register-user.dto";
import { LoginUserDto } from "../users/dto/login-user.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { password, userRole } = registerUserDto; 
  
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
  
    const user = this.usersRepository.create({
      ...registerUserDto,
      password: hashedPassword,
      userRole,
    });
  
    return this.usersRepository.save(user);
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string; userStatus: string }> {
    const user = await this.usersRepository.findOneBy({ email: loginUserDto.email });

    if (!user || !(await bcrypt.compare(loginUserDto.password, user.password))) {
      throw new UnauthorizedException("Email ou mot de passe incorrect");
    }

    const payload = {
      sub: user.id,
      occasionalCourier: user.occasionalCourier,
      userFirstName: user.userFirstName,
      userLastName: user.userLastName,
      valid: user.valid,
      userStatus: user.userStatus,
      userSubscription: user.userSubscription,
      prestataireRoleId: user.prestataireRoleId,
    };    
    const accessToken = this.jwtService.sign(payload);


    return { 
      accessToken, 
      userStatus: user.userStatus 
    };
  }
}
