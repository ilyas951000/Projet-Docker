import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Localisation } from './entities/localisation.entity';
import { CreateLocalisationDto } from './dto/create-localisation.dto';
import { UpdateLocalisationDto } from './dto/update-localisation.dto';
import { geocodeAddress } from 'src/common/geocoding.util'; // adapt if path differs

@Injectable()
export class LocalisationService {
  constructor(
    @InjectRepository(Localisation)
    private readonly localisationRepo: Repository<Localisation>,
  ) {}

  async create(dto: CreateLocalisationDto): Promise<Localisation> {
    const currentFullAddress = `${dto.currentStreet}, ${dto.currentPostalCode} ${dto.currentCity}`;
    const destinationFullAddress = `${dto.destinationStreet}, ${dto.destinationPostalCode} ${dto.destinationCity}`;

    const currentCoords = await geocodeAddress(currentFullAddress);
    const destinationCoords = await geocodeAddress(destinationFullAddress);

    const localisation = this.localisationRepo.create({
      currentStreet: dto.currentStreet,
      currentCity: dto.currentCity,
      currentPostalCode: parseInt(dto.currentPostalCode.toString(), 10),

      destinationStreet: dto.destinationStreet,
      destinationCity: dto.destinationCity,
      destinationPostalCode: parseInt(dto.destinationPostalCode.toString(), 10),

      currentLatitude: currentCoords.lat,
      currentLongitude: currentCoords.lng,
      destinationLatitude: destinationCoords.lat,
      destinationLongitude: destinationCoords.lng,

      packageId: dto.packageId,
    });

    return this.localisationRepo.save(localisation);
  }


  findAll() {
    return this.localisationRepo.find();
  }

  findOne(id: number) {
    return this.localisationRepo.findOne({ where: { id } });
  }


  async update(id: number, dto: UpdateLocalisationDto) {
    if (dto.currentPostalCode) {
      dto.currentPostalCode = parseInt(dto.currentPostalCode.toString(), 10);
    }
    if (dto.destinationPostalCode) {
      dto.destinationPostalCode = parseInt(dto.destinationPostalCode.toString(), 10);
    }
    await this.localisationRepo.update(id, dto);
    return this.findOne(id);
  }

  async findByPackageId(packageId: number) {
    return this.localisationRepo.findOne({
      where: { packageId },
    });
  }



  async remove(id: number) {
    await this.localisationRepo.delete(id);
    return { message: `Localisation #${id} supprimée.` };
  }
}
