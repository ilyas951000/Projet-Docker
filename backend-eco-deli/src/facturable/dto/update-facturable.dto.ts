import { PartialType } from '@nestjs/mapped-types';
import { CreateFacturableDto } from './create-facturable.dto';

export class UpdateFacturableDto extends PartialType(CreateFacturableDto) {}
