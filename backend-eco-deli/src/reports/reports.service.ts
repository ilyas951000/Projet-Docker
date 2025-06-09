import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Report } from './entities/report.entity'
import { CreateReportDto } from './dto/create-report.dto'
import { Advertisement } from 'src/advertisements/entities/advertisement.entity'
import { Package } from 'src/packages/entities/package.entity'
import { User } from 'src/users/entities/user.entity'

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    @InjectRepository(Advertisement)
    private readonly advertisementRepo: Repository<Advertisement>,

    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  async create(dto: CreateReportDto): Promise<Report> {
    const report = new Report()

    report.reason = dto.reason
    report.status = dto.status || 'en_attente'

    if (dto.advertisementId) {
      const ad = await this.advertisementRepo.findOneBy({ id: dto.advertisementId })
      if (ad) {
        report.advertisement = ad
      }
    }

    if (dto.packageId) {
      const pkg = await this.packageRepo.findOneBy({ id: dto.packageId })
      if (pkg) {
        report.package = pkg
      }
    }

    if (dto.clientId) {
      const client = await this.userRepo.findOneBy({ id: dto.clientId })
      if (!client) {
        throw new NotFoundException('Client introuvable')
      }
      report.client = client
    }

    return this.reportRepository.save(report)
  }
}
