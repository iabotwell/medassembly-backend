import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './reports.service';

export async function shiftReport(req: AuthRequest, res: Response) {
  try { res.json(await service.getShiftReport(req.params.shiftId)); } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function eventReport(req: AuthRequest, res: Response) {
  try { res.json(await service.getEventReport(req.params.eventId)); } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function patientReport(req: AuthRequest, res: Response) {
  try {
    const data = await service.getPatientReport(req.params.patientId);
    if (!data) return res.status(404).json({ error: 'Patient not found' });
    res.json(data);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function suppliesReport(req: AuthRequest, res: Response) {
  try { res.json(await service.getSuppliesReport(req.params.eventId)); } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function teamReport(req: AuthRequest, res: Response) {
  try { res.json(await service.getTeamReport(req.params.eventId)); } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function dashboard(_req: AuthRequest, res: Response) {
  try {
    const data = await service.getDashboardData();
    if (!data) return res.status(404).json({ error: 'No active event' });
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
}
