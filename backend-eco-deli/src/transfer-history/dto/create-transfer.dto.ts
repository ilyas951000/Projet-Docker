export class CreateTransferHistoryDto {
  fromCourierId: number;
  toCourierId: number;
  packageId: number;
  address: string;
  postalCode: string;
  city: string;
  transferCode: string;

  livreur1Progress?: number; // optionnel au début
  livreur2Progress?: number;
}
