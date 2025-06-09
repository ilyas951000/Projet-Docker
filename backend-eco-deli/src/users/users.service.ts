import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.userFirstName = createUserDto.userFirstName;
    user.userLastName = createUserDto.userLastName;
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        userFirstName: true,
        userLastName: true,
        userSubscription: true,
      },
    });
  }


  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);  // Le type id est maintenant un nombre
  }

  async getPendingUsers(): Promise<User[]> {
    return this.usersRepository.find({
      where: { valid: false },
      relations: ['justificationDocument'], // Charge le document associé
    });
  }

  async validateUser(id: number): Promise<User | null> {
    await this.usersRepository.update(id, { valid: true });
    return this.findOne(id);
  }

  async findAllAdmins(): Promise<User[]> {
    return this.usersRepository.find({
      where: { userStatus: 'admin' },
      select: {
        id: true,
        userFirstName: true,
        userLastName: true,
      },
    });
  }

  

  async findAllPrestataireIds(): Promise<number[]> {
    const users = await this.usersRepository.find({
      where: { userStatus: 'prestataire' },
      select: ['id'],
    });
    return users.map((user) => user.id);
  }

  async rejectUser(id: number): Promise<User | null> {
    return this.findOne(id);
  }

  async findAllPrestatairesWithRole() {
    const users = await this.usersRepository.find({
      where: { userStatus: 'prestataire' },
      relations: ['prestataireRole'],
    });

    return users.map((user) => ({
      id: user.id,
      prestataireRoleId: user.prestataireRole ? user.prestataireRole.id : null,
      userFirstName: user.userFirstName,
      userLastName: user.userLastName,
      email: user.email,
      userStatus: user.userStatus,
      userSubscription: user.userSubscription,
      valid: user.valid,
    }));
  }



  async findByStatus(status: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { userStatus: status },
      select: ['id', 'userFirstName', 'userLastName', 'email', 'userStatus'],
    });
  }


}

