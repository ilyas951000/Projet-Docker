import { Injectable } from '@nestjs/common';
import { CreateContractElementDto } from './dto/create-contract-element.dto';
import { UpdateContractElementDto } from './dto/update-contract-element.dto';

@Injectable()
export class ContractElementService {
  create(createContractElementDto: CreateContractElementDto) {
    return 'This action adds a new contractElement';
  }

  findAll() {
    return `This action returns all contractElement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contractElement`;
  }

  update(id: number, updateContractElementDto: UpdateContractElementDto) {
    return `This action updates a #${id} contractElement`;
  }

  remove(id: number) {
    return `This action removes a #${id} contractElement`;
  }
}
