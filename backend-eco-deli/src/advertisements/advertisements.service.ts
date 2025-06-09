import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Advertisement } from './entities/advertisement.entity';
import { Package } from 'src/packages/entities/package.entity';
import { Localisation } from 'src/localisation/entities/localisation.entity';
import fetch from 'node-fetch'; // N'oublie pas d'installer node-fetch si ce n'est pas déjà fait
import { Report } from 'src/reports/entities/report.entity';


@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectRepository(Advertisement)
    private readonly adRepo: Repository<Advertisement>,

    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,

    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
  ) {}

  private validateId(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID invalide');
    }
  }

  private async getCoordinates(address: string): Promise<{ lat: number; lon: number } | null> {
    const apiKey = process.env.OPENCAGE_API_KEY;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json() as {
      results: { geometry: { lat: number; lng: number } }[]
    };

    if (!data.results || !data.results.length) return null;

    const { lat, lng } = data.results[0].geometry;
    return { lat, lon: lng };
  }


  async findAllAdmin() {
    return this.adRepo.find({
      relations: ['users'],
      order: { publicationDate: 'DESC' },
    });
  }




  async create(dto: CreateAdvertisementDto): Promise<Advertisement> {
    const { packages: pkgDtos, ...adProps } = dto;
    const ad = this.adRepo.create(adProps);

    if (Array.isArray(pkgDtos)) {
      ad.packages = await Promise.all(
        pkgDtos.map(async (pkgDto) => {
          const pkg = new Package();
          pkg.packageName = pkgDto.item;
          pkg.packageQuantity = pkgDto.quantity;
          pkg.packageDimension = pkgDto.dimension ?? '';
          pkg.packageWeight = pkgDto.weight ?? 0;
          pkg.deliveryStatus = 'en attente';
          pkg.prioritaire = pkgDto.prioritaire === true;


          const rawLocs = Array.isArray(pkgDto.localisations) ? pkgDto.localisations : [];

          pkg.localisations = await Promise.all(
            rawLocs.map(async (locDto) => {
              const loc = new Localisation();
              loc.currentStreet = locDto.currentStreet;
              loc.currentCity = locDto.currentCity;
              loc.currentPostalCode = locDto.currentPostalCode;
              loc.destinationStreet = locDto.destinationStreet;
              loc.destinationCity = locDto.destinationCity;
              loc.destinationPostalCode = locDto.destinationPostalCode;

              const currentAddress = `${locDto.currentStreet}, ${locDto.currentPostalCode} ${locDto.currentCity}`;
              const destAddress = `${locDto.destinationStreet}, ${locDto.destinationPostalCode} ${locDto.destinationCity}`;

              const currentCoords = await this.getCoordinates(currentAddress);
              const destCoords = await this.getCoordinates(destAddress);

              if (currentCoords) {
                loc.currentLatitude = currentCoords.lat;
                loc.currentLongitude = currentCoords.lon;
              }

              if (destCoords) {
                loc.destinationLatitude = destCoords.lat;
                loc.destinationLongitude = destCoords.lon;
              }

              loc.package = pkg;
              return loc;
            }),
          );

          pkg.advertisement = ad;
          return pkg;
        }),
      );
    }

    return this.adRepo.save(ad);
  }

  async findAll(): Promise<Advertisement[]> {
    const ads = await this.adRepo.find({ relations: ['packages'] });
    return this.addComputedStatus(ads);
  }

  async findOne(id: number): Promise<Advertisement> {
    this.validateId(id);
    const ad = await this.adRepo.findOne({
      where: { id },
      relations: ['packages', 'packages.localisations','users'],
    });
    if (!ad) throw new NotFoundException('Annonce non trouvée');
    return this.addComputedStatus(ad);
  }

  async update(id: number, updateDto: UpdateAdvertisementDto): Promise<Advertisement> {
    this.validateId(id);
    const ad = await this.findOne(id);
    Object.assign(ad, updateDto);
    return this.adRepo.save(ad);
  }

  async updatePrice(id: number, newPrice: number): Promise<Advertisement> {
    this.validateId(id);
    const ad = await this.adRepo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException('Annonce introuvable');
    ad.advertisementPrice = newPrice;
    return this.adRepo.save(ad);
  }

  async remove(id: number): Promise<void> {
    this.validateId(id);
    const ad = await this.adRepo.findOne({
      where: { id },
      relations: ['packages'],
    });
    if (!ad) throw new NotFoundException(`L'annonce avec l'id ${id} n'existe pas.`);
    await this.adRepo.remove(ad);
  }

  async validate(id: number): Promise<Advertisement> {
    this.validateId(id);
    const ad = await this.findOne(id);
    ad.isValidated = true;
    return this.adRepo.save(ad);
  }

  async findByUser(usersId: number): Promise<Advertisement[]> {
    const ads = await this.adRepo.find({
      where: { usersId },
      relations: ['packages', 'packages.localisations'],
      order: { publicationDate: 'DESC' },
    });
    return this.addComputedStatus(ads);
  }

  async delete(adId: number) {
      // 1. Supprimer les signalements liés à cette annonce
      await this.reportRepo.delete({ advertisement: { id: adId } });

      // 2. Supprimer les colis liés à cette annonce (en cascade possible selon ta config)
      await this.packageRepo.delete({ advertisement: { id: adId } });

      // 3. Supprimer l'annonce
      const result = await this.adRepo.delete({ id: adId });

      if (result.affected === 0) throw new NotFoundException('Annonce non trouvée ou déjà supprimée');
      return { message: 'Annonce supprimée avec succès' };
    }

  async findOthers(userId: number): Promise<Advertisement[]> {
    const ads = await this.adRepo.find({
      where: {
      usersId: Not(userId),
      advertisementType: 'client', // on exclut les chariots
    },

      relations: ['packages', 'packages.localisations'],
      order: { publicationDate: 'DESC' },
    });
    return this.addComputedStatus(ads);
  }

  async findValidated(): Promise<Advertisement[]> {
    const ads = await this.adRepo.find({
      where: { isValidated: true },
      relations: ['packages', 'packages.localisations'],
    });
    return this.addComputedStatus(ads);
  }

  private addComputedStatus<T extends Advertisement | Advertisement[]>(input: T): T {
    const compute = (ad: Advertisement) => {
      if (!ad.packages || ad.packages.length === 0) {
        ad.advertisementStatus = 'en attente';
        return;
      }

      const statuses = ad.packages.map((p) => p.deliveryStatus);

      if (statuses.every((status) => status === 'livré')) {
        ad.advertisementStatus = 'livré';
      } else if (statuses.some((status) => status === 'en transit')) {
        ad.advertisementStatus = 'en transit';
      } else if (statuses.every((status) => status === 'pris en charge')) {
        ad.advertisementStatus = 'pris en charge';
      } else {
        ad.advertisementStatus = 'en attente';
      }
    };

    if (Array.isArray(input)) {
      input.forEach(compute);
    } else {
      compute(input);
    }

    return input;
  }

  async findAllChariotDrops(): Promise<Advertisement[]> {
    const ads = await this.adRepo.find({
      where: { advertisementType: 'chariot' },
      relations: ['packages', 'packages.localisations', 'users'],
      order: { publicationDate: 'DESC' },
    });

    return this.addComputedStatus(ads);
  }

}
