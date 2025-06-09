import { Injectable } from '@nestjs/common';
import { CreateFacturableDto } from './dto/create-facturable.dto';
import { UpdateFacturableDto } from './dto/update-facturable.dto';

@Injectable()
export class FacturableService {
  create(createFacturableDto: CreateFacturableDto) {
    return 'This action adds a new facturable';
  }

  findAll() {
    return `This action returns all facturable`;
  }

  findOne(id: number) {
    return `This action returns a #${id} facturable`;
  }

  update(id: number, updateFacturableDto: UpdateFacturableDto) {
    return `This action updates a #${id} facturable`;
  }

  remove(id: number) {
    return `This action removes a #${id} facturable`;
  }
}
