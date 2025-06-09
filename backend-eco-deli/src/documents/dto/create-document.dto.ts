import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsOptional()
  documentType: string;

  @IsDateString()
  @IsNotEmpty()
  documentDate: Date;

  @IsString()
  @IsNotEmpty()
  format: string;

  @IsDateString()
  @IsNotEmpty()
  expirationDate: Date;

  // Ces champs peuvent être fournis par le service à partir du fichier uploadé
  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  filePath?: string;
}
