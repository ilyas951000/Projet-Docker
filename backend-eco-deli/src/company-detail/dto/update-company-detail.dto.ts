import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDetailDto } from './create-company-detail.dto';

export class UpdateCompanyDetailDto extends PartialType(CreateCompanyDetailDto) {}
