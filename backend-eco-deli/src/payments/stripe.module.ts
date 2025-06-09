// src/payments/stripe.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { User } from 'src/users/entities/user.entity';
import { Transfer } from './entities/transfer.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Intervention } from 'src/intervention/entities/intervention.entity';
import { Subscription as SubscriptionEntity } from 'src/subscriptions/entities/subscription.entity';
import { PlatformFee } from './entities/platform-fee.entity';
import { Package } from 'src/packages/entities/package.entity';
import { Advertisement } from 'src/advertisements/entities/advertisement.entity';
import { PackagesModule } from 'src/packages/packages.module';
import { AdvertisementsModule } from 'src/advertisements/advertisements.module';
import { Virement } from 'src/virement/entities/virement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Transfer,
      Intervention,
      SubscriptionEntity,
      PlatformFee,
      Package,
      Advertisement,
      Virement,
    ]),
    AuthModule,
    PackagesModule,          // ✅ nécessaire pour injecter PackageRepo
    AdvertisementsModule,    // ✅ nécessaire pour injecter AdvertisementRepo
  ],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],  // (facultatif selon usage)
})
export class StripeModule {}
