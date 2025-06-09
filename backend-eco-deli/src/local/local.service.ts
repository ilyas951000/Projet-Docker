import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Local } from './entities/local.entity';
import { CreateLocalDto } from './dto/create-local.dto';

@Injectable()
export class LocalService {
  constructor(@InjectRepository(Local) private repo: Repository<Local>) {}

  async create(dto: CreateLocalDto): Promise<Local> {
    const local = this.repo.create(dto);
    return this.repo.save(local);
  }

  async findAll(): Promise<Local[]> {
    return this.repo.find({ relations: ['boxes'] });
  }

  async findOne(id: number): Promise<Local> {
    const local = await this.repo.findOne({ where: { id }, relations: ['boxes'] });
    if (!local) throw new NotFoundException(`Local with ID ${id} not found`);
    return local;
  }

  async update(id: number, dto: CreateLocalDto): Promise<Local> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Local with ID ${id} not found`);
  }
}