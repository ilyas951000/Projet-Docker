// src/public-profile/dto/create-public-profile.dto.ts

import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePublicProfileDto {
  @IsString() prestationType: string;
  @IsNumber() price: number;
  @IsString() description: string;

  @IsOptional() @IsString() zoneIntervention?: string;
  @IsOptional() @IsString() disponibilites?: string;
  @IsOptional() @IsString() biographie?: string;
  @IsOptional() @IsString() langues?: string;
  @IsOptional() @IsString() delaiReponse?: string;
  @IsOptional() @IsString() tempsMoyenIntervention?: string;
}
