import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface UserPresence {
  socketId: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  boardId: string;
  activeCardId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private presenceMap = new Map<string, UserPresence>();

  handleConnection(client: Socket) {
    this.logger.log(`Socket client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket client disconnected: ${client.id}`);
    const presence = this.presenceMap.get(client.id);
    if (presence) {
      this.presenceMap.delete(client.id);
      this.broadcastPresence(presence.boardId);
    }
  }

  @SubscribeMessage('board:join')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; userId: string; userName: string; avatarUrl?: string },
  ) {
    client.join(`board:${data.boardId}`);
    this.presenceMap.set(client.id, {
      socketId: client.id,
      boardId: data.boardId,
      userId: data.userId,
      userName: data.userName,
      avatarUrl: data.avatarUrl,
    });

    this.logger.log(`User ${data.userName} joined board:${data.boardId}`);
    this.broadcastPresence(data.boardId);
  }

  @SubscribeMessage('board:leave')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ) {
    client.leave(`board:${data.boardId}`);
    this.presenceMap.delete(client.id);
    this.broadcastPresence(data.boardId);
  }

  @SubscribeMessage('board:mutation')
  handleBoardMutation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; type: string; payload: any },
  ) {
    // Broadcast to other clients in the board room except sender
    client.to(`board:${data.boardId}`).emit('board:mutation', data);
  }

  @SubscribeMessage('card:active')
  handleCardActive(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string; cardId?: string },
  ) {
    const presence = this.presenceMap.get(client.id);
    if (presence) {
      presence.activeCardId = data.cardId;
      this.broadcastPresence(data.boardId);
    }
  }

  private broadcastPresence(boardId: string) {
    const activeUsers = Array.from(this.presenceMap.values()).filter(
      (p) => p.boardId === boardId,
    );
    this.server.to(`board:${boardId}`).emit('board:presence', activeUsers);
  }
}
