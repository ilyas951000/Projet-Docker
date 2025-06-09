  import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, ParseIntPipe } from '@nestjs/common';
  import { CompanyDetailService } from './company-detail.service';
  import { CreateCompanyDetailDto } from './dto/create-company-detail.dto';
  import { UpdateCompanyDetailDto } from './dto/update-company-detail.dto';
  import { CompanyDetail } from './entities/company-detail.entity';

  @Controller('company-detail')
  export class CompanyDetailController {
    constructor(private readonly companyDetailService: CompanyDetailService) {}

    @Post()
    create(@Body() createCompanyDetailDto: CreateCompanyDetailDto) {
      return this.companyDetailService.create(createCompanyDetailDto);
    }

    @Get()
    findAll() {
      return this.companyDetailService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number): Promise<CompanyDetail | null> {
      return this.companyDetailService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCompanyDetailDto: UpdateCompanyDetailDto) {
      return this.companyDetailService.update(+id, updateCompanyDetailDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.companyDetailService.remove(+id);
    }


    @Get('user/:userId')
    findAllByUser(
      @Param('userId', ParseIntPipe) userId: number
    ): Promise<CompanyDetail[]> {
      return this.companyDetailService.findAllByUser(userId);
    }

  }
