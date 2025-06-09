export class CreateLocalisationDto {
  currentStreet: string;
  currentCity: string;
  currentPostalCode: number;

  destinationStreet: string;
  destinationCity: string;
  destinationPostalCode: number;

  packageId: number;
}
