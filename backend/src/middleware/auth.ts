import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../utils/helpers.js';
import { prisma } from '../index.js';

export interface AuthRequest extends Request {
  user?: JwtPayload;
  io?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.replace('Bearer ', '')
      : req.cookies?.accessToken;

    if (!token) throw new UnauthorizedError('Token d\'accès requis');

    const payload = await verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, nom: true, role: true, codeAcces: true, isActive: true },
    });

    if (!user || !user.isActive) throw new UnauthorizedError('Utilisateur inactif ou supprimé');

    req.user = { id: user.id, nom: user.nom, role: user.role, codeAcces: user.codeAcces };
    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization
      ? req.headers.authorization.replace('Bearer ', '')
      : req.cookies?.accessToken;

    if (!token) return next();

    const payload = await verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, nom: true, role: true, codeAcces: true, isActive: true },
    });

    if (user?.isActive) {
      req.user = { id: user.id, nom: user.nom, role: user.role, codeAcces: user.codeAcces };
    }
    next();
  } catch {
    next();
  }
};

export const requireAdmin = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'ADMIN') {
    throw new ForbiddenError('Accès administrateur requis');
  }
  next();
};

export const requireOwnerOrAdmin = (userIdParam = 'id') => (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const targetId = parseInt(req.params[userIdParam], 10);
  if (req.user?.role !== 'ADMIN' && req.user?.id !== targetId) {
    throw new ForbiddenError('Accès non autorisé');
  }
  next();
};

export const checkRoomAccess = async (
  userId: number,
  roomId: number,
  prisma: PrismaClient
): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { permissions: { where: { roomId, acces: true } } },
  });
  if (!user) return false;

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return false;

  if (room.type === 'COMMUNE') return true;
  return user.permissions.some(p => p.roomId === roomId && p.acces);
};