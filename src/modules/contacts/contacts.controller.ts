import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './contacts.service';
import { createAuditLog } from '../../utils/helpers';

export async function list(req: AuthRequest, res: Response) {
  try { res.json(await service.listContacts(req.query.type as string)); } catch (err: any) { res.status(500).json({ error: err.message }); }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const c = await service.createContact(req.body);
    await createAuditLog(req.user.id, 'CREATE_CONTACT', 'emergency_contacts', c.id);
    res.status(201).json(c);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const c = await service.updateContact(req.params.id, req.body);
    await createAuditLog(req.user.id, 'UPDATE_CONTACT', 'emergency_contacts', req.params.id);
    res.json(c);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await service.deleteContact(req.params.id);
    await createAuditLog(req.user.id, 'DELETE_CONTACT', 'emergency_contacts', req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}
