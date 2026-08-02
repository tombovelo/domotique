import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import os from 'os';

import { PrismaClient } from '@prisma/client';
import { errorHandler, notFoundHandler } from './utils/helpers.js';

import authRouter from './routes/auth.js';
import roomsRouter from './routes/rooms.js';
import usersRouter from './routes/users.js';
import gpioRouter from './routes/gpio.js';

function getLocalIp(): string {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return '127.0.0.1';
}

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ip: getLocalIp(), timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/users', usersRouter);
app.use('/api/gpio', gpioRouter);

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join:room', (roomId: number) => {
    socket.join(`room:${roomId}`);
  });

  socket.on('join:user', (userId: number) => {
    socket.join(`user:${userId}`);
  });

  socket.on('subscribe:rooms', () => {
    socket.join('rooms:all');
  });

  socket.on('subscribe:gpio', () => {
    socket.join('gpio:all');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  const ip = getLocalIp();
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Local IP: ${ip}`);
  console.log(`📡 Socket.io ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});