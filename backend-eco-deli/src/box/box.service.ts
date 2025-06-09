import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Box } from './entities/box.entity';
import { Local } from 'src/local/entities/local.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateBoxDto } from './dto/create-box.dto';

@Injectable()
export class BoxService {
  constructor(
    @InjectRepository(Box)
    private readonly boxRepository: Repository<Box>,

    @InjectRepository(Local)
    private readonly localRepository: Repository<Local>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateBoxDto): Promise<Box> {
    const local = await this.localRepository.findOneBy({ id: dto.localId });
    if (!local) throw new NotFoundException('Local not found');

    const box = this.boxRepository.create({
      label: dto.label,
      size: dto.size,
      local,
      status: 'available',
    });

    return this.boxRepository.save(box);
  }

  async findAllWithReservations(): Promise<Box[]> {
    return this.boxRepository.find({
      relations: [
        'local',
        'reservations',
        'reservations.client',
        'reservations.package'
      ]
    });
  }


  async update(id: number, dto: Partial<Box>): Promise<Box> {
    const box = await this.boxRepository.findOneBy({ id });
    if (!box) throw new NotFoundException('Box not found');

    Object.assign(box, dto);
    return this.boxRepository.save(box);
  }

  async delete(id: number): Promise<void> {
    const box = await this.boxRepository.findOne({
      where: { id },
      relations: ['reservations'],
    });
    if (!box) throw new NotFoundException('Box not found');

    if (box.reservations?.length) {
      throw new BadRequestException('Cannot delete a box with reservations');
    }

    await this.boxRepository.remove(box);
  }




  async findByLocal(localId: number): Promise<Box[]> {
    return this.boxRepository.find({
      where: { local: { id: localId } },
      relations: ['local'],
    });
  }

  async findAll(): Promise<Box[]> {
    return this.boxRepository.find({ relations: ['local'] });
  }

}
