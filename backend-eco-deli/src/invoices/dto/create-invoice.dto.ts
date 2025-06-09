export class CreateInvoiceDto {
    invoiceNumber?: string;
    issueDate: Date;
    paymentDate: Date;
    totalAmount: string;
    paymentStatus: boolean;
    paymentMethod: string;
    serviceTitle: string;
    userId: number;
    userType: 'client' | 'prestataire';
    transferId?: number;
  }
  