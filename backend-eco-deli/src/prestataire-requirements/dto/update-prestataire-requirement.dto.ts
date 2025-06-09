import { PartialType } from '@nestjs/mapped-types';
import { CreatePrestataireRequirementDto } from './create-prestataire-requirement.dto';

export class UpdatePrestataireRequirementDto extends PartialType(CreatePrestataireRequirementDto) {}
