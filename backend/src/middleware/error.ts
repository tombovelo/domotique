import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(public statusCode: number, public message: string, public details?: any) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.flatten(),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Contrainte unique violée', field: err.meta?.target });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  return res.status(500).json({ error: 'Erreur serveur interne' });
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);