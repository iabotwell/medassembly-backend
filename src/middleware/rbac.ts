import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

const PERMISSIONS: Record<string, string[]> = {
  ADMIN:           ['*'],
  ENCARGADO_TURNO: ['patients:read', 'patients:create', 'patients:update', 'triage:read', 'attentions:read', 'shifts:read', 'shifts:create', 'shifts:update', 'emergency:sos', 'emergency:transfer', 'discharge', 'reports:*', 'dashboard:*', 'events:create', 'events:update', 'congregations:read', 'contacts:read', 'contacts:create', 'contacts:update'],
  ENCARGADO_SALUD: ['patients:read', 'patients:create', 'patients:update', 'triage:read', 'triage:create', 'triage:update', 'attentions:read', 'attentions:create', 'attentions:update', 'measurements:read', 'measurements:create', 'measurements:update', 'discharge', 'emergency:sos', 'emergency:transfer', 'emergency:camillero', 'supplies:read', 'supplies:create', 'supplies:update', 'reports:*', 'dashboard:*'],
  DOCTOR:          ['patients:read', 'triage:read', 'triage:create', 'triage:update', 'attentions:read', 'attentions:create', 'attentions:update', 'measurements:read', 'measurements:create', 'measurements:update', 'discharge', 'emergency:sos', 'emergency:transfer', 'emergency:camillero', 'reports:*', 'dashboard:*'],
  ASISTENTE:       ['patients:create', 'patients:read', 'triage:read', 'triage:create', 'triage:update', 'attentions:create', 'attentions:update', 'measurements:read', 'measurements:create', 'measurements:update', 'emergency:camillero', 'dashboard:*'],
  CAMILLERO:       ['dashboard:read'],
  CONSULTA:        ['dashboard:read', 'reports:read'],
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Only SUPER ADMIN can delete anything
    if (permission.endsWith(':delete')) {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Solo el Super Administrador puede eliminar registros.' });
      }
      return next();
    }

    const userPerms = PERMISSIONS[req.user.role] || [];

    if (userPerms.includes('*')) return next();
    if (userPerms.includes(permission)) return next();

    const [resource] = permission.split(':');
    if (userPerms.includes(`${resource}:*`)) return next();

    return res.status(403).json({ error: 'Forbidden' });
  };
};
