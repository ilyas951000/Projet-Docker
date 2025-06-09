import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rates } from './entities/rates.entity';
import { CreateRateDto } from './dto/create-rate.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RatesService {
  constructor(
    @InjectRepository(Rates)
    private readonly ratesRepository: Repository<Rates>,
  ) {}

  async findByProvider(providerId: number): Promise<Rates[]> {
    return this.ratesRepository.find({
      where: { provider: { id: providerId } },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Rates[]> {
    return this.ratesRepository.find({
      relations: ['client', 'provider'],
      order: { createdAt: 'DESC' },
    });
  }


  async create(dto: CreateRateDto): Promise<Rates> {
    const rate = this.ratesRepository.create({
      rating: dto.rating,
      comment: dto.comment,
      createdAt: new Date(),
      client: { id: dto.clientId } as User,
      provider: { id: dto.providerId } as User,
    });

    return this.ratesRepository.save(rate);
  }
}
