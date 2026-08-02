import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authMiddleware, AuthRequest, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, AppError, NotFoundError, ConflictError } from '../utils/helpers.js';
import { roomSelect } from './rooms.js';

const prisma = new PrismaClient();

const router = Router();

const userCreateSchema = z.object({
  nom: z.string().min(1),
  codeAcces: z.string().min(4).max(10),
  role: z.enum(['ADMIN', 'MEMBRE']).default('MEMBRE'),
  dateExpiration: z.string().datetime().nullable().optional(),
  permissions: z.array(z.object({ roomId: z.number(), acces: z.boolean() })).default([]),
});

const userUpdateSchema = z.object({
  nom: z.string().min(1).optional(),
  codeAcces: z.string().min(4).max(10).optional(),
  role: z.enum(['ADMIN', 'MEMBRE']).optional(),
  dateExpiration: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.object({ roomId: z.number(), acces: z.boolean() })).optional(),
});

router.get('/', authMiddleware, requireAdmin, asyncHandler(async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    include: { permissions: { select: { id: true, userId: true, acces: true, createdAt: true, room: { select: roomSelect } } } },
    orderBy: { id: 'asc' },
  });
  res.json(users);
}));

router.get('/:id', authMiddleware, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { permissions: { select: { id: true, userId: true, acces: true, createdAt: true, room: { select: roomSelect } } } },
  });
  if (!user) throw new NotFoundError('Utilisateur');
  const { passwordHash, ...safe } = user;
  res.json(safe);
}));

router.post('/', authMiddleware, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parse = userCreateSchema.safeParse(req.body);
  if (!parse.success) throw new AppError(400, 'Validation échouée', parse.error.flatten());

  const { permissions, nom, codeAcces, role, dateExpiration } = parse.data;
  const code = codeAcces.toUpperCase();
  const passwordHash = await bcrypt.hash(code, 12);

  try {
    const user = await prisma.user.create({
      data: {
        nom,
        codeAcces: codeAcces.toUpperCase(),
        passwordHash,
        role,
        dateExpiration: dateExpiration ?? undefined,
        permissions: permissions.length ? { create: permissions } : undefined,
      },
    include: { permissions: { select: { id: true, userId: true, acces: true, createdAt: true, room: { select: roomSelect } } } },
    });
    const { passwordHash: _, ...safe } = user;
    res.status(201).json(safe);
  } catch (e: any) {
    if (e.code === 'P2002') throw new ConflictError('Code d\'accès déjà utilisé');
    throw e;
  }
}));

router.patch('/:id', authMiddleware, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  if (userId === 1) throw new AppError(403, 'Admin principal protégé');

  const parse = userUpdateSchema.safeParse(req.body);
  if (!parse.success) throw new AppError(400, 'Validation échouée', parse.error.flatten());

  const { permissions, codeAcces, ...data } = parse.data;
  const passwordHash = codeAcces ? await bcrypt.hash(codeAcces.toUpperCase(), 12) : undefined;

  await prisma.$transaction(async (tx) => {
    if (permissions) {
      await tx.piecePermission.deleteMany({ where: { userId } });
      if (permissions.length) {
        await tx.piecePermission.createMany({
          data: permissions.map(p => ({ userId, roomId: p.roomId, acces: p.acces })),
        });
      }
    }
    await tx.user.update({
      where: { id: userId },
      data: { ...data, ...(codeAcces && { codeAcces: codeAcces.toUpperCase(), passwordHash }) },
    });
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { permissions: { select: { id: true, userId: true, acces: true, createdAt: true, room: { select: roomSelect } } } },
  });
  if (!user) throw new NotFoundError('Utilisateur');
  const { passwordHash: _, ...safe } = user;
  res.json(safe);
}));

router.delete('/:id', authMiddleware, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  if (userId === 1) throw new AppError(403, 'Admin principal protégé');

  await prisma.user.delete({ where: { id: userId } });
  res.json({ message: 'Supprimé' });
}));

export default router;
