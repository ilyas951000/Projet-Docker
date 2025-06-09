import { Get, Injectable, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyDetailDto } from './dto/create-company-detail.dto';
import { UpdateCompanyDetailDto } from './dto/update-company-detail.dto';
import { CompanyDetail } from './entities/company-detail.entity';
import * as dayjs from 'dayjs';
@Injectable()
export class CompanyDetailService {
  constructor(
    @InjectRepository(CompanyDetail)
    private readonly repo: Repository<CompanyDetail>,
  ) {}

  create(createDto: CreateCompanyDetailDto) {
    return this.repo.save(createDto);
  }

  findAll(): Promise<CompanyDetail[]> {
    return this.repo.find();
  }

  findOne(id: number): Promise<CompanyDetail | null> {
  return this.repo.findOne({ where: { id } });
}


  async update(id: number, updateDto: UpdateCompanyDetailDto) {
  const company = await this.repo.findOne({ where: { id } });
  if (!company) {
    throw new NotFoundException(`CompanyDetail #${id} non trouvé`);
  }

  const currentYear = new Date().getFullYear().toString();
  if (company.currentYear !== currentYear) {
    throw new Error(`Seules les données de l'année en cours (${currentYear}) peuvent être modifiées.`);
  }

  return this.repo.update(id, updateDto);
}

  remove(id: number) {
    return this.repo.delete(id);
  }

  async findOneByUser(userId: number): Promise<CompanyDetail> {
    const company = await this.repo.findOne({
      where: { usersId: userId },
    });
    if (!company) {
      throw new NotFoundException(`CompanyDetail pour l'utilisateur #${userId} introuvable`);
    }
    return company;
  }
  async findAllByUser(userId: number): Promise<CompanyDetail[]> {
    return this.repo.find({
      where: { usersId: userId },
      order: { currentYear: 'ASC' },  // ou DESC selon votre préférence
    });
  }

}
