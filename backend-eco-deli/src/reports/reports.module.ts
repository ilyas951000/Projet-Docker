import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Report } from './entities/report.entity'
import { ReportsService } from './reports.service'
import { ReportsController } from './reports.controller'
import { Advertisement } from 'src/advertisements/entities/advertisement.entity'
import { Package } from 'src/packages/entities/package.entity'
import { User } from 'src/users/entities/user.entity'
import { Message } from 'src/message/entities/message.entity'
import { MessagesService } from 'src/message/messages.service'
import { UsersModule } from 'src/users/users.module' // 👈 nécessaire pour accéder à User

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      Advertisement,
      Package,
      User,
      Message,
    ]),
    UsersModule, // 👈 assure l'accès au repository User
  ],
  controllers: [ReportsController],
  providers: [ReportsService, MessagesService],
})
export class ReportsModule {}
