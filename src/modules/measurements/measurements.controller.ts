import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './measurements.service';
import { createAuditLog } from '../../utils/helpers';

export async function list(req: AuthRequest, res: Response) {
  try {
    const measurements = await service.listMeasurements(req.params.id);
    res.json(measurements);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
}

export async function add(req: AuthRequest, res: Response) {
  try {
    const measurement = await service.addMeasurement(req.params.id, req.user.id, req.body);
    await createAuditLog(req.user.id, 'ADD_MEASUREMENT', 'measurements', measurement.id, { attentionId: req.params.id });
    res.status(201).json(measurement);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}
