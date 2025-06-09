// src/messages/messages.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async findConversation(from: number, to: number, packageId?: number): Promise<Message[]> {
    const baseWhere = [
      { fromUserId: from, toUserId: to },
      { fromUserId: to, toUserId: from },
    ];

    if (packageId) {
      return this.messageRepo.find({
        where: baseWhere.map((cond) => ({ ...cond, packageId })),
        order: { timestamp: 'ASC' },
      });
    }

    return this.messageRepo.find({
      where: baseWhere,
      order: { timestamp: 'ASC' },
    });
  }


  async findReceivedMessages(userId: number): Promise<Message[]> {
    return this.messageRepo.find({
      where: { toUserId: userId },
      order: { timestamp: 'DESC' },
    });
  }

  async findAllUserMessages(userId: number): Promise<Message[]> {
    return this.messageRepo.find({
      where: [
        { fromUserId: userId },
        { toUserId: userId },
      ],
      order: { timestamp: 'DESC' },
    });
  }



  async create(data: {
    fromUserId: number;
    toUserId: number;
    content: string;
    packageId?: number;
  }) {
    const message = this.messageRepo.create(data);
    return this.messageRepo.save(message);
  }


}
