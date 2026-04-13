import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

let io: Server;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${(socket as any).userId}`);

    socket.on('join:event', ({ eventId }) => {
      socket.join(`event:${eventId}`);
    });

    socket.on('join:attention', ({ attentionId }) => {
      socket.join(`attention:${attentionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${(socket as any).userId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

// Emit helpers
export function emitDashboardUpdate(eventId: string, data: any) {
  if (io) io.to(`event:${eventId}`).emit('dashboard:update', data);
}

export function emitPatientStatusChanged(eventId: string, data: { patientId: string; newStatus: string; triageColor?: string }) {
  if (io) io.to(`event:${eventId}`).emit('patient:statusChanged', data);
}

export function emitEmergencyActivated(eventId: string, data: any) {
  if (io) io.to(`event:${eventId}`).emit('emergency:activated', data);
}

export function emitEmergencyResolved(eventId: string, data: { emergencyId: string }) {
  if (io) io.to(`event:${eventId}`).emit('emergency:resolved', data);
}

export function emitShiftChanged(eventId: string, data: any) {
  if (io) io.to(`event:${eventId}`).emit('shift:changed', data);
}

export function emitNewMeasurement(attentionId: string, data: any) {
  if (io) io.to(`attention:${attentionId}`).emit('measurement:new', data);
}
