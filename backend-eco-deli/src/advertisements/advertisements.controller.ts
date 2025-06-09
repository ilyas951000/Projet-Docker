import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  Get,
  Patch,
  Param,
  BadRequestException,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

import { AdvertisementsService } from './advertisements.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';

@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly advertisementsService: AdvertisementsService) {}
  
  // ✅ Obtenir les annonces validées
  @Get('validated')
  async findAllValidated() {
    return this.advertisementsService.findValidated();
  }

  // ✅ Obtenir mes annonces (authentifié)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMyAds(@Req() req) {
    const userId = req.user.userId || req.user.sub;
    return this.advertisementsService.findByUser(userId);
  }

  // ✅ Récupérer toutes les annonces (admin uniquement)
  @Get('admin')
  @UseGuards(JwtAuthGuard) // tu peux ajouter un guard de rôle ici
  async findAllAdmin() {
    return this.advertisementsService.findAllAdmin();
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.advertisementsService.delete(id);
  }


  // ✅ Obtenir les annonces des autres utilisateurs (authentifié)
  @Get('others')
  @UseGuards(JwtAuthGuard)
  async findOtherAds(@Req() req) {
    const userId = req.user.userId || req.user.sub;
    return this.advertisementsService.findOthers(userId);
  }

  // ✅ Créer une annonce avec photo (upload géré ici)
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname); // .jpg, .png, etc.
          const baseName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${baseName}${ext}`);
        },
      }),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAdvertisementDto: CreateAdvertisementDto,
    @Req() req,
  ) {
    let pkgs: any[] = [];
    
    // ✅ Parse et validation du champ packages
    if (createAdvertisementDto.packages) {
      if (typeof createAdvertisementDto.packages === 'string') {
        try {
          pkgs = JSON.parse(createAdvertisementDto.packages);
        } catch {
          throw new BadRequestException('packages doit être un JSON valide');
        }
      } else {
        pkgs = createAdvertisementDto.packages;
      }
    }

    for (const [i, p] of pkgs.entries()) {
      if (typeof p.quantity !== 'number' || p.quantity < 1) {
        throw new BadRequestException(`packages[${i}].quantity invalide`);
      }
      if (typeof p.item !== 'string' || !p.item.trim()) {
        throw new BadRequestException(`packages[${i}].item invalide`);
      }
      if (!Array.isArray(p.localisations) || p.localisations.length === 0) {
        throw new BadRequestException(`packages[${i}].localisations manquantes`);
      }

      for (const [j, loc] of p.localisations.entries()) {
        if (typeof loc.currentStreet !== 'string') {
          throw new BadRequestException(`packages[${i}].localisations[${j}].currentStreet invalide`);
        }
      }
    }

    if (file) {
      createAdvertisementDto.advertisementPhoto = file.filename;
    }
    
    const userId = req.user.userId || req.user.sub;
    createAdvertisementDto.usersId = userId;
    createAdvertisementDto.packages = pkgs;
    createAdvertisementDto.advertisementType = createAdvertisementDto.advertisementType || 'client';


    return this.advertisementsService.create(createAdvertisementDto);
  }

  // ✅ Récupérer une annonce par ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.advertisementsService.findOne(id);
  }

  // ✅ Mise à jour d'une annonce
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAdvertisementDto,
    @Req() req,
  ) {
    return this.advertisementsService.update(id, updateDto);
  }

  // ✅ Supprimer une annonce
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.advertisementsService.remove(+id);
  }

  // ✅ Mise à jour du prix
  @Patch(':id/update-price')
  async updatePrice(
    @Param('id', ParseIntPipe) id: number,
    @Body('newPrice') newPrice: number,
  ) {
    return this.advertisementsService.updatePrice(id, newPrice);
  }

  @Get('chariot-drops')
  @UseGuards(JwtAuthGuard)
  async getChariotDrops() {
    return this.advertisementsService.findAllChariotDrops();
  }

  
}
