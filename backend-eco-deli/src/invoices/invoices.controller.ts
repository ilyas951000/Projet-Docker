import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Response } from 'express';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(+id, updateInvoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(+id);
  }

  @Get('client/:userId/history')
  async getClientHistory(
    @Param('userId') userId: string,
    @Query('sortBy') sortBy: string = 'issueDate',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
    @Query('status') status?: 'paid' | 'unpaid',
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.invoicesService.getInvoiceHistoryByUser(
      +userId,
      sortBy,
      order,
      status,
      month ? +month : undefined,
      year ? +year : undefined
    );
  }

  @Get('provider/:userId/history')
  async getProviderHistory(
    @Param('userId') userId: string,
    @Query('sortBy') sortBy: string = 'issueDate',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
    @Query('status') status?: 'paid' | 'unpaid',
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const uid = +userId;
    await this.invoicesService.ensureProviderInvoicesExist(uid); // génère les factures manquantes
    return this.invoicesService.getInvoiceHistoryByUser(
      uid,
      sortBy,
      order,
      status,
      month ? +month : undefined,
      year ? +year : undefined
    );
  }

  @Post('generate/single/:transferId')
  async generateFromTransfer(@Param('transferId') transferId: string) {
    const invoices = await this.invoicesService.createFromTransfer(+transferId);
    return { invoiceIds: invoices.map((i) => i.id) };
  }

  @Post('generate/monthly/:userId')
  async generateMonthlyInvoice(
    @Param('userId') userId: string,
    @Query('month') month: string,
    @Query('year') year: string
  ) {
    const invoice = await this.invoicesService.createMonthlyInvoiceForUser(
      +userId,
      +month,
      +year
    );
    return { invoiceId: invoice.id };
  }

  @Post('generate/monthly/provider/:userId')
  async generateMonthlyProviderInvoice(
    @Param('userId') userId: string,
    @Query('month') month: string,
    @Query('year') year: string
  ) {
    const invoice = await this.invoicesService.createMonthlyInvoiceForProvider(
      +userId,
      +month,
      +year
    );
    return { invoiceId: invoice.id };
  }

  @Get('pdf/:id')
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${id}.pdf`);
    await this.invoicesService.generateInvoicePdf(+id, res);
  }
}
