import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './congregations.service';
import { createAuditLog } from '../../utils/helpers';

export async function list(_req: AuthRequest, res: Response) {
  try { res.json(await service.listCongregations()); } catch (err: any) { res.status(500).json({ error: err.message }); }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const c = await service.createCongregation(req.body);
    await createAuditLog(req.user.id, 'CREATE_CONGREGATION', 'congregations', c.id);
    res.status(201).json(c);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const c = await service.updateCongregation(req.params.id, req.body);
    await createAuditLog(req.user.id, 'UPDATE_CONGREGATION', 'congregations', req.params.id);
    res.json(c);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await service.deleteCongregation(req.params.id);
    await createAuditLog(req.user.id, 'DELETE_CONGREGATION', 'congregations', req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function listElders(req: AuthRequest, res: Response) {
  try { res.json(await service.listElders(req.params.id)); } catch (err: any) { res.status(500).json({ error: err.message }); }
}

export async function createElder(req: AuthRequest, res: Response) {
  try {
    const elder = await service.createElder(req.params.id, req.body);
    await createAuditLog(req.user.id, 'CREATE_ELDER', 'elders', elder.id);
    res.status(201).json(elder);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function updateElder(req: AuthRequest, res: Response) {
  try {
    const elder = await service.updateElder(req.params.id, req.body);
    await createAuditLog(req.user.id, 'UPDATE_ELDER', 'elders', req.params.id);
    res.json(elder);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function removeElder(req: AuthRequest, res: Response) {
  try {
    await service.deleteElder(req.params.id);
    await createAuditLog(req.user.id, 'DELETE_ELDER', 'elders', req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}
