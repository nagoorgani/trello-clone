import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './auth-store';
import { useBoardStore } from './board-store';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export interface PresenceUser {
  socketId: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  boardId: string;
  activeCardId?: string;
}

export function useBoardSocket(boardId?: string) {
  const { user } = useAuthStore();
  const { fetchBoard } = useBoardStore();
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!boardId || !user) return;

    const s = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      s.emit('board:join', {
        boardId,
        userId: user.id,
        userName: user.name,
        avatarUrl: user.avatarUrl,
      });
    };

    const onPresence = (users: PresenceUser[]) => {
      setPresenceUsers(users);
    };

    const onMutation = (data: { boardId: string; type: string; payload: any }) => {
      if (data.boardId === boardId) {
        // Refetch fresh board state from backend to synchronize multi-user edits
        fetchBoard(boardId);
      }
    };

    if (s.connected) {
      onConnect();
    } else {
      s.on('connect', onConnect);
    }

    s.on('board:presence', onPresence);
    s.on('board:mutation', onMutation);

    return () => {
      s.emit('board:leave', { boardId });
      s.off('connect', onConnect);
      s.off('board:presence', onPresence);
      s.off('board:mutation', onMutation);
    };
  }, [boardId, user, fetchBoard]);

  const emitMutation = (type: string, payload: any) => {
    if (!boardId) return;
    const s = getSocket();
    s.emit('board:mutation', { boardId, type, payload });
  };

  const emitActiveCard = (cardId?: string) => {
    if (!boardId) return;
    const s = getSocket();
    s.emit('card:active', { boardId, cardId });
  };

  return {
    presenceUsers,
    isConnected,
    emitMutation,
    emitActiveCard,
  };
}
