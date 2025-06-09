import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Box } from './entities/box.entity';
import { Local } from 'src/local/entities/local.entity';
import { User } from 'src/users/entities/user.entity'; // <- tu l'utilises ici
import { BoxController } from './box.controller';
import { BoxService } from './box.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Box, Local, User]), // ✅ ICI c’est obligatoire
  ],
  controllers: [BoxController],
  providers: [BoxService],
  exports: [BoxService],
})
export class BoxModule {}
