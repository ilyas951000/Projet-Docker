// src/transfer-history/transfer-history.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferHistory } from './entities/transfer-history.entity';
import { Localisation } from 'src/localisation/entities/localisation.entity';
import { calculateDistance } from 'src/utils/distance.util';

@Injectable()
export class TransferHistoryService {
  constructor(
    @InjectRepository(TransferHistory)
    private readonly transferRepo: Repository<TransferHistory>,

    @InjectRepository(Localisation)
    private readonly localisationRepo: Repository<Localisation>,
  ) {}

  async getProgressInfo(packageId: number) {
    const transfer = await this.transferRepo.findOne({
      where: { packageId },
      order: { transferDate: 'DESC' },
    });

    if (!transfer) {
      throw new NotFoundException('Aucun transfert trouvé pour ce colis.');
    }

    const localisation = await this.localisationRepo.findOne({
      where: { packageId },
    });

    if (!localisation) {
      throw new NotFoundException('Localisation introuvable pour ce colis.');
    }

    const totalDistance = calculateDistance(
      localisation.currentLatitude,
      localisation.currentLongitude,
      localisation.destinationLatitude,
      localisation.destinationLongitude
    );

    const doneDistance = calculateDistance(
      localisation.currentLatitude,
      localisation.currentLongitude,
      transfer.latitude,
      transfer.longitude
    );

    const progress1 = Math.round((doneDistance / totalDistance) * 100);
    const progress2 = 100 - progress1;

    return {
      address: transfer.address,
      city: transfer.city,
      postalCode: transfer.postalCode,
      livreur1Progress: progress1,
      livreur2Progress: progress2,
      fromCourierId: transfer.fromCourierId,
      toCourierId: transfer.toCourierId,
    };
  }
}
