import { IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateLocalDto {
  @IsString()
  city: string;

  @IsString()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  capacity: number;

  @IsBoolean()
  active: boolean;
}