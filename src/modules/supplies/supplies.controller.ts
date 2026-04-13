import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './supplies.service';
import { createAuditLog } from '../../utils/helpers';

export async function list(_req: AuthRequest, res: Response) {
  try { res.json(await service.listSupplies()); } catch (err: any) { res.status(500).json({ error: err.message }); }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const s = await service.createSupply(req.body);
    await createAuditLog(req.user.id, 'CREATE_SUPPLY', 'supplies', s.id);
    res.status(201).json(s);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const s = await service.updateSupply(req.params.id, req.body);
    await createAuditLog(req.user.id, 'UPDATE_SUPPLY', 'supplies', req.params.id);
    res.json(s);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}
