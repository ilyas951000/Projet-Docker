import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAdvertisementDto {
  @IsOptional()
  @IsString()
  advertisementPhoto?: string;

  @IsNotEmpty()
  publicationDate: Date;

  @IsString()
  @IsOptional()
  additionalInformation?: string;

  @IsNumber()
  advertisementPrice: number;

  @IsString()
  creatorRole: string;

  @IsNumber()
  usersId: number;

  advertisementType?: 'client' | 'chariot';

  @IsOptional()
  @IsArray()
  packages?: Array<{
    quantity: number;
    item: string;
    dimension?: string;
    weight?: number;
    prioritaire?: boolean; 
    localisations?: Array<{
      currentStreet: string;
      currentCity: string;
      currentPostalCode: number;
      destinationStreet: string;
      destinationCity: string;
      destinationPostalCode: number;
    }>;
  }>;
}
