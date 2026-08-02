import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authMiddleware, AuthRequest, optionalAuth } from '../middleware/auth.js';
import { asyncHandler, AppError, UnauthorizedError } from '../utils/helpers.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { roomSelect } from './rooms.js';

const prisma = new PrismaClient();

const router = Router();

const loginSchema = z.object({
  codeAcces: z.string().min(1),
});

const registerSchema = z.object({
  nom: z.string().min(1),
  codeAcces: z.string().min(4).max(10),
  role: z.enum(['ADMIN', 'MEMBRE']).default('MEMBRE'),
});

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const COOKIE_CLEAR_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

const setTokens = async (res: Response, user: { id: number; nom: string; role: string }) => {
  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);

  return { accessToken, refreshToken };
};

const clearTokens = async (res: Response, refreshToken?: string) => {
  if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  res.clearCookie('accessToken', COOKIE_CLEAR_OPTS);
  res.clearCookie('refreshToken', COOKIE_CLEAR_OPTS);
};

router.post('/login', asyncHandler(async (req: AuthRequest, res: Response) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) throw new AppError(400, 'Validation échouée', parse.error.flatten());

  const codeAcces = parse.data.codeAcces.toUpperCase();
  const user = await prisma.user.findUnique({ where: { codeAcces } });
  if (!user || !user.isActive) throw new UnauthorizedError('Code d\'accès incorrect');

  if (user.dateExpiration && new Date(user.dateExpiration) < new Date()) {
    throw new UnauthorizedError('Accès expiré');
  }

  const valid = await bcrypt.compare(codeAcces, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Code d\'accès incorrect');

  const tokens = await setTokens(res, { id: user.id, nom: user.nom, role: user.role });

  res.json({
    user: { id: user.id, nom: user.nom, codeAcces: user.codeAcces, role: user.role },
    ...tokens,
  });
}));

router.post('/register', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) throw new AppError(400, 'Validation échouée', parse.error.flatten());

  const { nom, codeAcces, role } = parse.data;
  const passwordHash = await bcrypt.hash(codeAcces, 12);

  try {
    const user = await prisma.user.create({
      data: { nom, codeAcces: codeAcces.toUpperCase(), passwordHash, role },
      select: { id: true, nom: true, codeAcces: true, role: true },
    });
    res.status(201).json(user);
  } catch (e: any) {
    if (e.code === 'P2002') throw new AppError(409, 'Code d\'accès déjà utilisé');
    throw e;
  }
}));

router.post('/refresh', asyncHandler(async (req: AuthRequest, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new UnauthorizedError('Refresh token requis');

  const payload = await verifyRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) throw new UnauthorizedError('Refresh token invalide ou expiré');

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, nom: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) throw new UnauthorizedError('Utilisateur inactif');

  const tokens = await setTokens(res, { id: user.id, nom: user.nom, role: user.role });
  res.json(tokens);
}));

router.post('/logout', asyncHandler(async (req: AuthRequest, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  await clearTokens(res, refreshToken);
  res.json({ message: 'Déconnecté' });
}));

router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { permissions: { select: { id: true, userId: true, acces: true, createdAt: true, room: { select: roomSelect } } } },
  });
  if (!user) throw new AppError(404, 'Utilisateur non trouvé');
  const { passwordHash, ...safe } = user;
  res.json(safe);
}));

router.get('/verify', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user) {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { permissions: { select: { id: true, userId: true, acces: true, createdAt: true, room: { select: roomSelect } } } },
    });
    if (user?.isActive) {
      const { passwordHash, ...safe } = user;
      return res.json({ authenticated: true, user: safe });
    }
  }
  res.json({ authenticated: false });
}));

router.patch('/me/code', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { newCode } = req.body;
  if (!newCode || newCode.length < 4 || newCode.length > 10) {
    throw new AppError(400, 'Code invalide (4-10 caractères)');
  }

  const exists = await prisma.user.findUnique({ where: { codeAcces: newCode.toUpperCase() } });
  if (exists && exists.id !== req.user!.id) throw new AppError(409, 'Code déjà utilisé');

  const passwordHash = await bcrypt.hash(newCode, 12);
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { codeAcces: newCode.toUpperCase(), passwordHash },
    select: { id: true, nom: true, codeAcces: true, role: true },
  });
  res.json(user);
}));

export default router;
