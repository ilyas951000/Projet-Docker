import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LivreurRequirement } from './entities/livreur-requirement.entity';

@Injectable()
export class LivreurRequirementsService {
  constructor(
    @InjectRepository(LivreurRequirement)
    private readonly requirementRepo: Repository<LivreurRequirement>,
  ) {}

  findAll(): Promise<LivreurRequirement[]> {
    return this.requirementRepo.find({ order: { id: 'ASC' } });
  }

  create(name: string): Promise<LivreurRequirement> {
    const req = this.requirementRepo.create({ name });
    return this.requirementRepo.save(req);
  }

  async delete(id: number): Promise<void> {
    await this.requirementRepo.delete(id);
  }
}
