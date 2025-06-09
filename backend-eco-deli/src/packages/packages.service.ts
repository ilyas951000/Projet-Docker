import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entities/package.entity';
import { User } from 'src/users/entities/user.entity';
import { Movement } from 'src/movements/entities/movement.entity';
import { Localisation } from 'src/localisation/entities/localisation.entity';
import { TransferHistory } from 'src/transfer-history/entities/transfer-history.entity';
import { geocodeAddress } from 'src/common/geocoding.util'; // ou le chemin exact selon ton projet
import { calculateDistance } from 'src/utils/distance.util';
import { TransferService } from 'src/payments/transfer.service';



@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,

    @InjectRepository(Localisation)
    private readonly localisationRepository: Repository<Localisation>,

    @InjectRepository(TransferHistory)
    private readonly transferRepository: Repository<TransferHistory>,

    private readonly transferService: TransferService,

  ) {}

  private isWithinRadius(lat1: number, lon1: number, lat2: number, lon2: number, radiusKm: number): boolean {
    const R = 6371;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c <= radiusKm;
  }

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    const pkg = this.packageRepository.create(createPackageDto);
    return this.packageRepository.save(pkg);
  }

  async findAssignedPackages(): Promise<Package[]> {
    return this.packageRepository
      .createQueryBuilder('package')
      .leftJoinAndSelect('package.users', 'users') // livreurs
      .leftJoinAndSelect('package.advertisement', 'advertisement')
      .leftJoinAndSelect('advertisement.users', 'advertisement_users') // ce nom est important
      .innerJoin('deliverPackage', 'dp', 'dp.packageId = package.id')
      .getMany();
  }






  async transferPackage({
    packageId,
    fromCourierId,
    toCourierId,
    address,
    postalCode,
    city,
  }: {
    packageId: number;
    fromCourierId: number;
    toCourierId: number;
    address: string;
    postalCode: string;
    city: string;
  }): Promise<{ transferCode: string }> {
    const fullAddress = `${address}, ${postalCode} ${city}, France`;

    const { lat, lng } = await geocodeAddress(fullAddress); // 📍 appel à ton utilitaire OpenCage

    const transferCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newTransfer = this.transferRepository.create({
      packageId,
      fromCourierId,
      toCourierId,
      address,
      postalCode,
      city,
      transferCode,
      isConfirmed: false,
      latitude: lat,
      longitude: lng,
    });

    await this.transferRepository.save(newTransfer);


    return { transferCode };
  }

  async getMyDeliveries(userId: number) {
    const packages = await this.packageRepository.find({
      relations: ['users', 'transferHistories'],
    });

    return packages.filter(pkg => {
      const isAssigned = pkg.users.some(u => u.id === userId);
      const lastTransfer = pkg.transferHistories?.at(-1);

      if (pkg.deliveryStatus !== 'transféré') {
        return isAssigned; // livreur actuel
      }

      // transfert en attente de confirmation → montrer au toCourier
      return lastTransfer?.toCourierId === userId && !lastTransfer.isConfirmed;
    });
  }




  async getDelivererForPackage(packageId: number) {
    const pkg = await this.packageRepository.findOne({
      where: { id: packageId },
      relations: ['users'],
    });
    if (!pkg || !pkg.users || pkg.users.length === 0) {
      throw new NotFoundException("Aucun livreur trouvé.");
    }
    return { userId: pkg.users[0].id };
  }


  async findUnpaidPackagesByClient(clientId: number): Promise<Package[]> {
    return this.packageRepository.createQueryBuilder('package')
      .leftJoin('package.advertisement', 'ad')
      .where('ad.usersId = :clientId', { clientId })
      .andWhere('package.isPaid = false OR package.isPaid = 0')
      .getMany();
  }

  async getPendingTransfersForUser(userId: number | string): Promise<Package[]> {
    const parsedId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    if (isNaN(parsedId)) throw new BadRequestException('ID du livreur invalide');

    const transfers = await this.transferRepository.find({
      where: {
        toCourierId: parsedId,
        isConfirmed: false,
      },
      relations: ['package'],
    });

    return transfers.map(t => t.package);
  }

  async getNearbyPackages(userId: number, radiusKm = 10) {
    const origin = await this.movementRepository.findOne({
      where: { userId, active: true },
      order: { createdAt: 'DESC' },
    });

    if (!origin || !origin.originLatitude || !origin.originLongitude)
      throw new NotFoundException('Coordonnées de départ manquantes');

    const packages = await this.packageRepository.createQueryBuilder('package')
      .leftJoinAndSelect('package.localisations', 'loc')
      .getMany();

    return packages.filter(pkg =>
      pkg.localisations?.some(loc =>
        this.isWithinRadius(origin.originLatitude, origin.originLongitude, loc.currentLatitude, loc.currentLongitude, radiusKm)
      )
    );
  }

  async getOnRoutePackages(userId: number, radiusKm = 10) {
    const movements = await this.movementRepository.find({
      where: { userId, active: true },
    });
    if (!movements.length) return [];

    const packages = await this.packageRepository.createQueryBuilder('package')
      .leftJoinAndSelect('package.localisations', 'loc')
      .getMany();

    return packages.filter(pkg =>
      pkg.localisations?.some(loc =>
        movements.some(m =>
          this.isWithinRadius(m.originLatitude, m.originLongitude, loc.currentLatitude, loc.currentLongitude, radiusKm) ||
          this.isWithinRadius(m.destinationLatitude, m.destinationLongitude, loc.destinationLatitude, loc.destinationLongitude, radiusKm)
        )
      )
    );
  }

  async markAsPaid(id: number) {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Colis non trouvé');
    pkg.isPaid = true;
    await this.packageRepository.save(pkg);
    return { message: 'Colis marqué comme payé.' };
  }

  findAll() {
    return this.packageRepository.find();
  }

  findOne(id: number) {
    return this.packageRepository.findOne({
      where: { id },
      relations: ['advertisement', 'users', 'localisations'], // adapte selon ton besoin
    });
  }


  update(id: number, updatePackageDto: UpdatePackageDto) {
    return this.packageRepository.update(id, updatePackageDto);
  }

  remove(id: number) {
    return this.packageRepository.delete(id);
  }

  async findAvailablePackages(): Promise<any[]> {
    const packages = await this.packageRepository.createQueryBuilder('package')
      .leftJoinAndSelect('package.advertisement', 'ad')
      .leftJoin('package.users', 'u')
      .where('u.id IS NULL')
      .getMany();

    return packages.map(pkg => ({ ...pkg, clientId: pkg.advertisement?.usersId || null }));
  }

  async takePackage(packageId: number, userId: number) {
    const pkg = await this.packageRepository.findOne({ where: { id: packageId }, relations: ['users'] });
    if (!pkg) throw new NotFoundException('Colis non trouvé');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if (!pkg.users) pkg.users = [];
    if (!pkg.users.some(u => u.id === user.id)) pkg.users.push(user);

    pkg.isPaid = false;
    await this.packageRepository.save(pkg);
    return { message: 'Colis pris en charge avec succès.' };
  }

  async findDeliveriesByUser(userId: number): Promise<Package[]> {
    return this.packageRepository.createQueryBuilder('p')
      .leftJoin('p.users', 'u')
      .where('u.id = :userId', { userId })
      .andWhere('p.deliveryStatus != :delivered', { delivered: 'livré' })
      .getMany();
  }

  async updateStatus(packageId: number, status: string): Promise<Package> {
    const pkg = await this.packageRepository.findOne({ where: { id: packageId } });
    if (!pkg) throw new NotFoundException(`Colis d'id ${packageId} non trouvé`);
    pkg.deliveryStatus = status;
    return this.packageRepository.save(pkg);
  }

  async findDeliveredPackagesByUser(userId: number): Promise<Package[]> {
    return this.packageRepository.createQueryBuilder('p')
      .leftJoin('p.users', 'u')
      .where('u.id = :userId', { userId })
      .andWhere('p.deliveryStatus = :status', { status: 'livré' })
      .getMany();
  }

  async findByAdvertisementId(advertisementId: number): Promise<Package[]> {
    return this.packageRepository.find({
      where: { advertisementId },
      order: { id: 'ASC' },
    });
  }

  async createTransfer(data: {
    packageId: number;
    fromCourierId: number;
    toCourierId: number;
    address: string;
    postalCode: string;
    city: string;
    transferCode: string;
    latitude: number;
    longitude: number;
  }) {
    const pkg = await this.packageRepository.findOne({
      where: { id: data.packageId },
      relations: ['users', 'localisations', 'advertisement'],
    });

    if (!pkg) throw new NotFoundException('Colis introuvable');

    const fromCourier = await this.userRepository.findOneBy({ id: data.fromCourierId });
    const toCourier = await this.userRepository.findOneBy({ id: data.toCourierId });

    if (!fromCourier || !toCourier) throw new NotFoundException('Livreur introuvable');

    const isCurrentCourier = pkg.users.some(u => u.id === data.fromCourierId);
    if (!isCurrentCourier) {
      throw new BadRequestException("Vous n'êtes pas le livreur actuel de ce colis");
    }

    const lat = data.latitude;
    const lng = data.longitude;

    const localisation = pkg.localisations?.[0];
    if (!localisation ||
        !localisation.currentLatitude ||
        !localisation.destinationLatitude ||
        !localisation.currentLongitude ||
        !localisation.destinationLongitude
    ) {
      throw new NotFoundException('Coordonnées de localisation incomplètes');
    }

    const totalDistance = calculateDistance(
      localisation.currentLatitude,
      localisation.currentLongitude,
      localisation.destinationLatitude,
      localisation.destinationLongitude
    );

    const previousTransfers = await this.transferRepository.find({
      where: { packageId: data.packageId },
      order: { transferDate: 'ASC' },
    });

    let startLat = localisation.currentLatitude;
    let startLng = localisation.currentLongitude;
    let cumulativeProgress = 0;

    if (previousTransfers.length > 0) {
      const lastTransfer = previousTransfers[previousTransfers.length - 1];
      startLat = lastTransfer.latitude;
      startLng = lastTransfer.longitude;
      cumulativeProgress = previousTransfers.reduce((sum, t) => sum + (t.livreur1Progress || 0), 0);
    }

    const segmentDistance = calculateDistance(startLat, startLng, lat, lng);
    const segmentProgress = Math.round((segmentDistance / totalDistance) * 100);

    const livreur1Progress = segmentProgress;
    const livreur2Progress = Math.max(0, 100 - (cumulativeProgress + segmentProgress));

    const transfer = this.transferRepository.create({
      ...data,
      latitude: lat,
      longitude: lng,
      isConfirmed: false,
      livreur1Progress,
      livreur2Progress,
    });

    pkg.deliveryStatus = 'transféré';
    await this.packageRepository.save(pkg);
    await this.transferRepository.save(transfer);

    // 🎯 Appel de la répartition des paiements si tout est prêt
    const clientId = pkg.advertisement?.usersId;
    const totalAmount = pkg.advertisement?.advertisementPrice;

    if (clientId && totalAmount) {
      await this.transferService.distributePayment(pkg.id, totalAmount, clientId);
    }

    return transfer;
  }


  async findByUser(userId: number): Promise<Package[]> {
    return this.packageRepository.find({
    where: { advertisement: { usersId: userId } },
    select: ['id', 'packageName'],
    relations: ['advertisement'],
  });
  }



  async confirmTransfer(packageId: number, toCourierId: number, code: string) {
    const transfer = await this.transferRepository.findOne({
      where: {
        packageId,
        toCourierId,
        transferCode: code,
        isConfirmed: false,
      },
    });

    if (!transfer) {
      throw new BadRequestException('Code invalide ou transfert introuvable');
    }

    transfer.isConfirmed = true;

    const pkg = await this.packageRepository.findOne({
      where: { id: packageId },
      relations: ['users'],
    });

    if (!pkg) {
      throw new NotFoundException('Colis introuvable');
    }

    pkg.deliveryStatus = 'en transit';

    // 🔄 Remplacement du livreur
    const toCourier = await this.userRepository.findOne({ where: { id: toCourierId } });
    if (!toCourier) throw new NotFoundException('Livreur introuvable');

    pkg.users = [toCourier]; // overwrite
    await this.packageRepository.save(pkg);
    return this.transferRepository.save(transfer);
  }


}
