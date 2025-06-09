import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNumber()
  userId: number;

  @IsString()
  subscriptionTitle: string;

  @IsBoolean()
  packageInsurance: boolean;

  @IsNumber()
  shippingDiscount: number;

  @IsNumber()
  priorityShipping: number;

  @IsNumber()
  permanentDiscount: number;

  @IsBoolean()
  supplement3000: boolean;
}
