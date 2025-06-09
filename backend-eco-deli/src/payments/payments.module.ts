// src/payments/payments.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StripeController } from './stripe.controller'
import { StripeService } from './stripe.service'
import { Transfer } from './entities/transfer.entity'
import { Intervention } from '../intervention/entities/intervention.entity'
import { PlatformFee } from './entities/platform-fee.entity'
import { User } from '../users/entities/user.entity'
import { Subscription } from '../subscriptions/entities/subscription.entity'
import { Package } from '../packages/entities/package.entity'
import { Advertisement } from '../advertisements/entities/advertisement.entity'
import { Virement } from 'src/virement/entities/virement.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transfer,
      Intervention,
      PlatformFee,
      User,
      Subscription,
      Package,
      Advertisement,
      Virement,
    ]),
  ],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [
    StripeService,
    TypeOrmModule, // ✅ ajoute ceci pour exposer TransferRepository
  ],
})
export class PaymentsModule {}

