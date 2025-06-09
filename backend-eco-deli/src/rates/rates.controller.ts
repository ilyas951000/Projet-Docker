import { Controller, Get, Param, ParseIntPipe, Post, Body } from '@nestjs/common';
import { RatesService } from './rates.service';
import { Rates } from './entities/rates.entity';
import { CreateRateDto } from './dto/create-rate.dto';

@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get('provider/:id')
  async getByProvider(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Rates[]> {
    return this.ratesService.findByProvider(id);
  }

  @Get()
  async findAll(): Promise<Rates[]> {
    return this.ratesService.findAll();
  }


  @Post()
  async createRate(@Body() dto: CreateRateDto): Promise<Rates> {
    return this.ratesService.create(dto);
  }
}
