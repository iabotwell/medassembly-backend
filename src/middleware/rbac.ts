import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

const PERMISSIONS: Record<string, string[]> = {
  ADMIN:     ['*'],
  ENCARGADO: ['patients:*', 'triage:*', 'attentions:read', 'shifts:*', 'emergency:sos', 'emergency:transfer', 'discharge', 'reports:*', 'dashboard:*', 'events:*', 'congregations:read', 'contacts:read'],
  DOCTOR:    ['patients:read', 'triage:*', 'attentions:*', 'measurements:*', 'discharge', 'emergency:*', 'reports:*', 'dashboard:*'],
  ASISTENTE: ['patients:create', 'patients:read', 'triage:*', 'attentions:create', 'attentions:update', 'measurements:*', 'emergency:camillero', 'dashboard:*'],
  CAMILLERO: ['dashboard:read'],
  CONSULTA:  ['dashboard:read', 'reports:read'],
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const userPerms = PERMISSIONS[req.user.role] || [];

    if (userPerms.includes('*')) return next();
    if (userPerms.includes(permission)) return next();

    const [resource] = permission.split(':');
    if (userPerms.includes(`${resource}:*`)) return next();

    return res.status(403).json({ error: 'Forbidden' });
  };
};
