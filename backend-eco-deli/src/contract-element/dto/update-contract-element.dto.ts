import { PartialType } from '@nestjs/mapped-types';
import { CreateContractElementDto } from './create-contract-element.dto';

export class UpdateContractElementDto extends PartialType(CreateContractElementDto) {}
