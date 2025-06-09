import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePackageDto {
  @IsOptional()
  @IsString()
  packageName: string;

  @IsOptional()
  @IsNumber()
  packageQuantity: number;

  @IsOptional()
  @IsNumber()
  packageWeight: number;

  @IsOptional()
  @IsString()
  packageDimension: string;

  @IsOptional()
  @IsNumber()
  advertisementId?: number;

  @IsOptional()
  @IsBoolean()
  prioritaire?: boolean; // ✅ ajoute ceci
}
