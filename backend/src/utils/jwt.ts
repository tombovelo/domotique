import { SignJWT, jwtVerify } from 'jose';
import { AppError } from './helpers.js';

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export interface JwtPayload {
  id: number;
  nom: string;
  role: string;
  codeAcces?: string;
}

export async function generateAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .sign(ACCESS_SECRET);
}

export async function generateRefreshToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRY)
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    throw new AppError(401, 'Access token invalide ou expiré');
  }
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    throw new AppError(401, 'Refresh token invalide ou expiré');
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}