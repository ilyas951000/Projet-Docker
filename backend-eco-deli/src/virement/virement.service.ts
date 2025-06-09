import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Virement } from './entities/virement.entity';

@Injectable()
export class VirementService {
  constructor(
    @InjectRepository(Virement)
    private readonly virementRepo: Repository<Virement>,
  ) {}

  async findAll(): Promise<Virement[]> {
    return this.virementRepo.find({
      relations: ['provider'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Virement> {
    const virement = await this.virementRepo.findOne({
      where: { id },
      relations: ['provider'],
    });

    if (!virement) {
      throw new NotFoundException('Virement non trouvé');
    }

    return virement;
  }

  async updateStatus(id: number, status: 'accepte' | 'refuse'): Promise<Virement> {
    const virement = await this.virementRepo.findOneBy({ id });

    if (!virement) {
      throw new NotFoundException('Virement non trouvé');
    }

    virement.status = status;
    return this.virementRepo.save(virement);
  }
}
