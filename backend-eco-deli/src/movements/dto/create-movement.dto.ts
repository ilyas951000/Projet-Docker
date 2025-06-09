import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateMovementDto {
  @IsInt()
  @Min(1)
  userId: number;

  // Origine
  @IsString()
  @IsNotEmpty()
  originStreet: string;

  @IsString()
  @IsNotEmpty()
  originCity: string;

  @IsInt()
  originPostalCode: number;

  // Destination
  @IsString()
  @IsNotEmpty()
  destinationStreet: string;

  @IsString()
  @IsNotEmpty()
  destinationCity: string;

  @IsInt()
  destinationPostalCode: number;

  @IsOptional()
  @IsDateString()
  availableOn?: Date;

  @IsOptional()
  @IsString()
  note?: string;
}
