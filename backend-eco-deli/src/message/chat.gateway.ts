import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  // Quand un message est envoyé par un client
  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() message: any) {
    // On émet le message uniquement pour le destinataire
    this.server.emit(`message-${message.toUserId}`, message);
  }
}
