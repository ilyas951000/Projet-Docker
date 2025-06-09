// src/transfer-history/transfer-history.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { TransferHistoryService } from './transfer-history.service';

@Controller('transfer-history')
export class TransferHistoryController {
  constructor(private readonly transferHistoryService: TransferHistoryService) {}

  @Get('progress/:packageId')
  getProgress(@Param('packageId') packageId: string) {
    return this.transferHistoryService.getProgressInfo(+packageId);
  }
}
