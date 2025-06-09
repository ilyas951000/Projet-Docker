import { PartialType } from '@nestjs/mapped-types';
import { CreateLocalisationDto } from './create-localisation.dto';

export class UpdateLocalisationDto extends PartialType(CreateLocalisationDto) {}
