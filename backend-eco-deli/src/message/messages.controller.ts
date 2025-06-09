// src/messages/messages.controller.ts
import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('received/:userId')
  findReceivedMessages(@Param('userId') userId: number) {
    return this.messagesService.findReceivedMessages(userId);
  }

  @Get('all/:userId')
  findAllUserMessages(@Param('userId') userId: number) {
    return this.messagesService.findAllUserMessages(userId);
  }

  @Get('conversation')
  async getConversation(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('packageId') packageId?: string,
  ) {
    const fromId = parseInt(from, 10);
    const toId = parseInt(to, 10);
    const pkgId = packageId ? parseInt(packageId, 10) : undefined;
    return this.messagesService.findConversation(fromId, toId, pkgId);
  }


  // messages.controller.ts
  @Post()

  async sendMessage(@Body() body: {
    fromUserId: number;
    toUserId: number;
    content: string;
    packageId?: number;
  }) {
    return this.messagesService.create(body);
  }

}
