import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicProfile } from './entities/public-profile.entity';
import { User } from '../users/entities/user.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { PublicProfileService } from './public-profile.service';
import { PublicProfileController } from './public-profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PublicProfile, User, Schedule])],
  controllers: [PublicProfileController],
  providers: [PublicProfileService],
})
export class PublicProfileModule {}
