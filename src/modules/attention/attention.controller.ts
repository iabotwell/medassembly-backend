import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './attention.service';
import { createAuditLog } from '../../utils/helpers';

export async function start(req: AuthRequest, res: Response) {
  try {
    const attention = await service.startAttention(req.params.id, req.user.id);
    await createAuditLog(req.user.id, 'START_ATTENTION', 'attentions', attention.id, { patientId: req.params.id });
    res.status(201).json(attention);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const attention = await service.updateAttention(req.params.id, req.body);
    await createAuditLog(req.user.id, 'UPDATE_ATTENTION', 'attentions', req.params.id);
    res.json(attention);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function addDoctorNotes(req: AuthRequest, res: Response) {
  try {
    const attention = await service.addDoctorNotes(req.params.id, req.body.doctorNotes);
    await createAuditLog(req.user.id, 'DOCTOR_NOTES', 'attentions', req.params.id);
    res.json(attention);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function discharge(req: AuthRequest, res: Response) {
  try {
    const attention = await service.dischargePatient(req.params.id, { dischargeNotes: req.body.dischargeNotes, dischargedBy: req.user.id });
    await createAuditLog(req.user.id, 'DISCHARGE', 'attentions', req.params.id);
    res.json(attention);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function addSupply(req: AuthRequest, res: Response) {
  try {
    const usage = await service.addSupplyUsage(req.params.id, req.body);
    await createAuditLog(req.user.id, 'ADD_SUPPLY', 'attention_supplies', usage.id);
    res.status(201).json(usage);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const result = await service.deleteAttention(req.params.id);
    await createAuditLog(req.user.id, 'DELETE_ATTENTION', 'attentions', req.params.id);
    res.json(result);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function removeMeasurement(req: AuthRequest, res: Response) {
  try {
    const result = await service.deleteMeasurement(req.params.measurementId);
    await createAuditLog(req.user.id, 'DELETE_MEASUREMENT', 'measurements', req.params.measurementId);
    res.json(result);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}
