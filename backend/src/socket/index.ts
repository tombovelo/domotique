import { ActionType } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../index.js';

const userSockets = new Map<number, Set<string>>();

export function socketHandler(io: Server) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.id;
    const userRole = socket.data.user.role;

    console.log(`🔌 User connected: ${socket.data.user.nom} (${userId})`);

    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId)!.add(socket.id);

    socket.join(`user:${userId}`);
    if (userRole === 'ADMIN') socket.join('admins');

    socket.on('room:toggle', async (data: { roomId: number; etat: boolean }) => {
      try {
        const room = await prisma.room.findUnique({ where: { id: data.roomId } });
        if (!room) return socket.emit('error', { message: 'Pièce non trouvée' });

        const hasAccess = await checkUserRoomAccess(userId, data.roomId, userRole);
        if (!hasAccess) return socket.emit('error', { message: 'Accès refusé' });

        const updated = await prisma.room.update({
          where: { id: data.roomId },
          data: { etat: data.etat },
        });

        await logAction({
          type: data.etat ? ActionType.ALLUMAGE : ActionType.EXTINCTION,
          roomId: data.roomId,
          userId,
          userNom: socket.data.user.nom,
          details: `Lumière ${data.etat ? 'allumée' : 'éteinte'} via app`,
        });

        io.emit('room:stateChanged', { roomId: updated.id, etat: updated.etat });
        broadcastToAdmins('room:stateChanged', { roomId: updated.id, etat: updated.etat });
      } catch (err) {
        socket.emit('error', { message: 'Erreur serveur' });
      }
    });

    socket.on('room:subscribe', (roomId: number) => {
      socket.join(`room:${roomId}`);
    });

    socket.on('room:unsubscribe', (roomId: number) => {
      socket.leave(`room:${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.data.user.nom} (${userId})`);
      userSockets.get(userId)?.delete(socket.id);
      if (userSockets.get(userId)?.size === 0) userSockets.delete(userId);
    });
  });
}

async function checkUserRoomAccess(userId: number, roomId: number, role: string): Promise<boolean> {
  if (role === 'ADMIN') return true;
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (room?.type === 'COMMUNE') return true;
  const perm = await prisma.piecePermission.findUnique({
    where: { userId_roomId: { userId, roomId } },
  });
  return perm?.acces === true;
}

async function logAction(data: {
  type: ActionType;
  roomId?: number;
  userId: number;
  userNom: string;
  details?: string;
}) {
  await prisma.actionLog.create({ data });
}

export function broadcastToAdmins(event: string, data: unknown) {
  // Called from routes after DB changes
}

export function getUserSocketIds(userId: number): string[] {
  return Array.from(userSockets.get(userId) || []);
}