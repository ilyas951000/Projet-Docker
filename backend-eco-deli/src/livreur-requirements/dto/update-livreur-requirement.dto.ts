import { PartialType } from '@nestjs/mapped-types';
import { CreateLivreurRequirementDto } from './create-livreur-requirement.dto';

export class UpdateLivreurRequirementDto extends PartialType(CreateLivreurRequirementDto) {}
