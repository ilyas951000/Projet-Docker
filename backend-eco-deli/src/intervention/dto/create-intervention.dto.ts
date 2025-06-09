export class CreateInterventionDto {
  prestataireId: number;
  clientId: number;
  type: string;
  commentaireClient?: string;
  prix: number;
}
