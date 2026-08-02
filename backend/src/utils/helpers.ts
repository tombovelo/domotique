import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(details: any) {
    super(400, 'Erreur de validation', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Ressource') {
    super(404, `${resource} non trouvé`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Non autorisé') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Accès interdit') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflit') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      console.error('❌ Error:', err);
    }
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  console.error('❌ Error:', err);

  if (err instanceof SyntaxError && 'status' in err) {
    return res.status(400).json({ error: 'JSON invalide' });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token invalide' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expiré' });
  }

  return res.status(500).json({ error: 'Erreur serveur interne' });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route non trouvée' });
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);
