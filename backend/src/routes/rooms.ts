import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest, requireAdmin, checkRoomAccess } from '../middleware/auth.js';
import { asyncHandler, AppError, NotFoundError, ForbiddenError } from '../utils/helpers.js';

const prisma = new PrismaClient();

const router = Router();

export const roomSelect = {
  id: true,
  nom: true,
  icone: true,
  type: true,
  pinRelais: true,
  pinInterrupteur: true,
  etat: true,
  createdAt: true,
  updatedAt: true,
} as const;

const createRoomSchema = z.object({
  nom: z.string().min(1),
  icone: z.string().default('💡'),
  type: z.enum(['COMMUNE', 'PRIVEE']),
  pinRelais: z.number().int().min(0).max(40),
  pinInterrupteur: z.number().int().min(0).max(40),
});

const updateRoomSchema = createRoomSchema.partial();

router.get('/', authMiddleware, asyncHandler(async (_req: AuthRequest, res: Response) => {
  const rooms = await prisma.room.findMany({
    select: roomSelect,
    orderBy: { id: 'asc' },
  });
  res.json(rooms);
}));

router.get('/accessible', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user!.role === 'ADMIN') {
    const rooms = await prisma.room.findMany({ select: roomSelect, orderBy: { id: 'asc' } });
    return res.json(rooms);
  }

  const perms = await prisma.piecePermission.findMany({
    where: { userId: req.user!.id, acces: true },
    select: { roomId: true },
  });
  const allowedIds = perms.map(p => p.roomId);

  const rooms = await prisma.room.findMany({
    select: roomSelect,
    where: {
      id: { in: allowedIds },
    },
    orderBy: { id: 'asc' },
  });
  res.json(rooms);
}));

router.get('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const room = await prisma.room.findUnique({
    where: { id: parseInt(req.params.id) },
    select: { ...roomSelect, gpioDevices: true },
  });
  if (!room) throw new NotFoundError('Pièce');
  res.json(room);
}));

router.patch('/:id/toggle', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const roomId = parseInt(req.params.id);
  const { etat } = req.body;

  if (typeof etat !== 'boolean') throw new AppError(400, 'etat doit être un booléen');

  const hasAccess = await checkRoomAccess(req.user!.id, roomId, prisma);
  if (!hasAccess) throw new ForbiddenError('Accès refusé à cette pièce');

  const room = await prisma.room.update({
    where: { id: roomId },
    data: { etat },
    select: roomSelect,
  });

  await prisma.actionLog.create({
    data: {
      type: etat ? 'ALLUMAGE' : 'EXTINCTION',
      roomId,
      userId: req.user!.id,
      userNom: req.user!.nom,
      details: `Lumière ${etat ? 'allumée' : 'éteinte'} via app`,
    },
  });

  req.io?.to(`room:${roomId}`).emit('room:stateChanged', { roomId, etat });
  req.io?.to('rooms:all').emit('room:stateChanged', { roomId, etat });

  res.json(room);
}));

router.post('/', authMiddleware, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parse = createRoomSchema.safeParse(req.body);
  if (!parse.success) throw new AppError(400, 'Validation échouée', parse.error.flatten());

  const room = await prisma.room.create({
    data: { ...parse.data, etat: false },
    select: roomSelect,
  });
  res.status(201).json(room);
}));

router.patch('/:id', authMiddleware, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parse = updateRoomSchema.safeParse(req.body);
  if (!parse.success) throw new AppError(400, 'Validation échouée', parse.error.flatten());

  const room = await prisma.room.update({
    where: { id: parseInt(req.params.id) },
    data: parse.data,
    select: roomSelect,
  });
  res.json(room);
}));

router.delete('/:id', authMiddleware, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.room.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Supprimé' });
}));

export default router;