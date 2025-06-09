import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContractElementService } from './contract-element.service';
import { CreateContractElementDto } from './dto/create-contract-element.dto';
import { UpdateContractElementDto } from './dto/update-contract-element.dto';

@Controller('contract-element')
export class ContractElementController {
  constructor(private readonly contractElementService: ContractElementService) {}

  @Post()
  create(@Body() createContractElementDto: CreateContractElementDto) {
    return this.contractElementService.create(createContractElementDto);
  }

  @Get()
  findAll() {
    return this.contractElementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractElementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContractElementDto: UpdateContractElementDto) {
    return this.contractElementService.update(+id, updateContractElementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractElementService.remove(+id);
  }
}
