import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { ReportsService } from './reports.service'
import { CreateReportDto } from './dto/create-report.dto'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull } from 'typeorm'
import { Report } from './entities/report.entity'
import { User } from 'src/users/entities/user.entity'
import { MessagesService } from 'src/message/messages.service'

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,

    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly messageService: MessagesService,
  ) {}

  @Post()
  create(@Body() dto: CreateReportDto) {
    return this.reportsService.create(dto)
  }

  @Get('open')
  @UseGuards(AuthGuard('jwt'))
  async getOpenReports(@Req() req: Request) {
    const adminId = (req.user as any).userId
    return this.reportRepo.find({
      where: [
        { handledBy: IsNull() },
        { handledBy: { id: adminId } },
      ],
      relations: ['client', 'package'],
    })
  }

  @Post('respond')
  @UseGuards(AuthGuard('jwt'))
  async respondToReport(
    @Body() body: { reportId: number; content: string },
    @Req() req: Request,
  ) {
    const user = req.user as any
    console.log('🛠 [ReportsController] Payload JWT reçu dans req.user :', user)

    const adminId = user.userId
    console.log('✅ adminId utilisé :', adminId)

    const report = await this.reportRepo.findOne({
      where: { id: body.reportId },
      relations: ['handledBy', 'client', 'package'],
    })

    console.log('📦 Report récupéré :', report)

    if (!report) throw new NotFoundException('Signalement introuvable')

    if (report.handledBy?.id && report.handledBy.id !== adminId) {
      throw new BadRequestException('Ce signalement est déjà pris en charge')
    }

    if (!report.handledBy) {
      const admin = await this.userRepo.findOneBy({ id: adminId })
      if (!admin) {
        console.log('❌ Admin introuvable pour adminId =', adminId)
        throw new NotFoundException('Admin introuvable')
      }

      report.handledBy = admin
      await this.reportRepo.save(report)
    }

    if (report.client) {
      console.log(`📨 Envoi du message de l'admin ${adminId} vers le client ${report.client.id}`)
      return this.messageService.create({
        fromUserId: adminId,
        toUserId: report.client.id,
        content: body.content,
        packageId: report.package?.id,
      })
    } else {
      console.log('ℹ️ Aucun client lié au report, message non envoyé.')
      return {
        message: 'Le signalement est bien pris en charge, mais aucun client n’est lié. Aucun message envoyé.',
      }
    }
  }
}
