import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createDto: CreateSubscriptionDto): Promise<Subscription> {
    const user = await this.userRepo.findOne({ where: { id: createDto.userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const subscription = this.subscriptionRepo.create({
      subscriptionTitle: createDto.subscriptionTitle,
      packageInsurance: createDto.packageInsurance,
      shippingDiscount: createDto.shippingDiscount,
      priorityShipping: createDto.priorityShipping,
      permanentDiscount: createDto.permanentDiscount,
      supplement3000: createDto.supplement3000,
      users: user,
    });

    return await this.subscriptionRepo.save(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return await this.subscriptionRepo.find({ relations: ['users'] });
  }

  async findByUserId(userId: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { users: { id: userId } },
      relations: ['users'],
    });

    if (!subscription) {
      throw new NotFoundException(`Aucun abonnement trouvé pour l'utilisateur ${userId}`);
    }

    return subscription;
  }


  async findOne(id: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({ where: { id }, relations: ['users'] });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }
}
