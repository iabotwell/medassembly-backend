import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './emergency.service';
import { createAuditLog } from '../../utils/helpers';

export async function activate(req: AuthRequest, res: Response) {
  try {
    const emergency = await service.activateEmergency(req.params.id, {
      level: req.body.level,
      authorizedById: req.user.id,
      notes: req.body.notes,
    });
    await createAuditLog(req.user.id, 'ACTIVATE_EMERGENCY', 'emergencies', emergency.id, {
      patientId: req.params.id, level: req.body.level,
    });
    res.status(201).json(emergency);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function resolve(req: AuthRequest, res: Response) {
  try {
    const emergency = await service.resolveEmergency(req.params.id, req.body);
    await createAuditLog(req.user.id, 'RESOLVE_EMERGENCY', 'emergencies', req.params.id);
    res.json(emergency);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function listActive(_req: AuthRequest, res: Response) {
  try { res.json(await service.listActiveEmergencies()); } catch (err: any) { res.status(500).json({ error: err.message }); }
}
