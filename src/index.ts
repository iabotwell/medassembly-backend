import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { initSocket } from './socket';
import { logger } from './utils/logger';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import eventsRoutes from './modules/events/events.routes';
import congregationsRoutes from './modules/congregations/congregations.routes';
import contactsRoutes from './modules/contacts/contacts.routes';
import suppliesRoutes from './modules/supplies/supplies.routes';
import patientsRoutes from './modules/patients/patients.routes';
import triageRoutes from './modules/triage/triage.routes';
import attentionRoutes from './modules/attention/attention.routes';
import measurementsRoutes from './modules/measurements/measurements.routes';
import emergencyRoutes from './modules/emergency/emergency.routes';
import shiftsRoutes from './modules/shifts/shifts.routes';
import whatsappRoutes from './modules/whatsapp/whatsapp.routes';
import reportsRoutes from './modules/reports/reports.routes';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes — All protected with JWT (except auth/login and auth/firebase)
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/congregations', congregationsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/supplies', suppliesRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/attentions', attentionRoutes);
app.use('/api/attentions', measurementsRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/shifts', shiftsRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/reports', reportsRoutes);

// Audit logs route (admin only)
import { authMiddleware } from './middleware/auth';
import { requirePermission } from './middleware/rbac';
import prisma from './config/database';

app.get('/api/audit-logs', authMiddleware, requirePermission('audit:read'), async (req, res) => {
  try {
    const { userId, action, entity, startDate, endDate } = req.query;
    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Error handler
app.use(errorHandler);

// Start server
httpServer.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

export default app;
