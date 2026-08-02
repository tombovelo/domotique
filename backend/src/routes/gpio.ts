import { Router, Response } from 'express';
import { z } from 'zod';
import { ActionType, PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../utils/helpers.js';

const router = Router();
const prisma = new PrismaClient();

const gpioSchema = z.object({
  pin: z.number().int().positive().max(40),
  type: z.enum(['RELAIS', 'INTERRUPTEUR', 'CAPTEUR']),
  nom: z.string().min(1),
  roomId: z.number().int().nullable().optional(),
  actif: z.boolean().default(true),
});

router.get('/', authMiddleware, asyncHandler(async (_req: AuthRequest, res: Response) => {
  const devices = await prisma.gpioDevice.findMany({
    include: { room: { select: { id: true, nom: true } } },
    orderBy: { pin: 'asc' },
  });
  res.json(devices);
}));

router.post('/', authMiddleware, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parse = gpioSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const exists = await prisma.gpioDevice.findUnique({ where: { pin: parse.data.pin } });
  if (exists) throw new AppError(409, 'Pin déjà utilisé');

  const device = await prisma.gpioDevice.create({
    data: parse.data,
    include: { room: { select: { id: true, nom: true } } },
  });
  res.status(201).json(device);
}));

router.patch('/:id', authMiddleware, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parse = gpioSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const device = await prisma.gpioDevice.update({
    where: { id: parseInt(req.params.id) },
    data: parse.data,
    include: { room: { select: { id: true, nom: true } } },
  });
  res.json(device);
}));

router.post('/:id/toggle', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const device = await prisma.gpioDevice.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!device) throw new AppError(404, 'Périphérique non trouvé');

  const updated = await prisma.gpioDevice.update({
    where: { id: device.id },
    data: { etat: !device.etat },
    include: { room: { select: { id: true, nom: true } } },
  });

  await prisma.actionLog.create({
    data: {
      type: updated.etat ? ActionType.ALLUMAGE : ActionType.EXTINCTION,
      userId: req.user!.id,
      userNom: req.user!.nom,
      details: `GPIO ${device.pin} (${device.nom}) via API`,
    },
  });

  req.io?.to('gpio:all').emit('gpio:updated', updated);
  res.json(updated);
}));

router.delete('/:id', authMiddleware, requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.gpioDevice.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Supprimé' });
}));

export default router;