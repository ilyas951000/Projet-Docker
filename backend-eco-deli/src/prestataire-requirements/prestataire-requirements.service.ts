import { Injectable } from '@nestjs/common';
import { CreatePrestataireRequirementDto } from './dto/create-prestataire-requirement.dto';
import { UpdatePrestataireRequirementDto } from './dto/update-prestataire-requirement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PrestataireRequirement } from './entities/prestataire-requirement.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PrestataireRequirementsService {
  constructor(
    @InjectRepository(PrestataireRequirement)
    private readonly requirementRepo: Repository<PrestataireRequirement>,
  ) {}


  create(createPrestataireRequirementDto: CreatePrestataireRequirementDto) {
    return 'This action adds a new prestataireRequirement';
  }

  findAll() {
    return `This action returns all prestataireRequirements`;
  }

  findOne(id: number) {
    return `This action returns a #${id} prestataireRequirement`;
  }

  update(id: number, updatePrestataireRequirementDto: UpdatePrestataireRequirementDto) {
    return `This action updates a #${id} prestataireRequirement`;
  }

  remove(id: number) {
    return `This action removes a #${id} prestataireRequirement`;
  }
  async findByRole(roleId: number) {
    return this.requirementRepo.find({
      where: {
        role: { id: roleId },
      },
    });
  }
}
