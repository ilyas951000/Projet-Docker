import { IsOptional, IsNumber } from 'class-validator'

export class CreateReportDto {
  @IsNumber()
  packageId: number

  @IsNumber()
  advertisementId: number

  @IsOptional()
  @IsNumber()
  clientId?: number

  reason: string
  status?: string
}
