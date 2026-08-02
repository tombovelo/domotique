import { io, Socket } from 'socket.io-client';
import { getBaseUrl } from './api';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = getBaseUrl();
    console.log('[SOCKET] Connecting to:', url);

    socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[SOCKET] Connected:', socket?.id);
      socket?.emit('subscribe:rooms');
    });

    socket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.log('[SOCKET] Error:', err.message);
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
