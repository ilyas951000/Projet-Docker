import { PartialType } from '@nestjs/mapped-types';
import { CreatePrestataireRoleDto } from './create-prestataire-role.dto';

export class UpdatePrestataireRoleDto extends PartialType(CreatePrestataireRoleDto) {}
