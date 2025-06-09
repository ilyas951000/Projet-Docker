import { IsString, IsIn, IsNumber, IsOptional } from 'class-validator';

export class CreateBoxDto {
  @IsString()
  label: string;

  @IsIn(['small', 'medium', 'large'])
  size: 'small' | 'medium' | 'large';

  @IsNumber()
  localId: number;

  @IsOptional()
  @IsNumber()
  clientId?: number;
}