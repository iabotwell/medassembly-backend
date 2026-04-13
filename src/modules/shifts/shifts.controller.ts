import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './shifts.service';
import { createAuditLog } from '../../utils/helpers';

export async function list(req: AuthRequest, res: Response) {
  try { res.json(await service.listShifts(req.query.eventId as string)); } catch (err: any) { res.status(500).json({ error: err.message }); }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const shift = await service.createShift(req.body);
    await createAuditLog(req.user.id, 'CREATE_SHIFT', 'shifts', shift.id);
    res.status(201).json(shift);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const shift = await service.updateShift(req.params.id, req.body);
    await createAuditLog(req.user.id, 'UPDATE_SHIFT', 'shifts', req.params.id);
    res.json(shift);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function activate(req: AuthRequest, res: Response) {
  try {
    const shift = await service.activateShift(req.params.id);
    await createAuditLog(req.user.id, 'ACTIVATE_SHIFT', 'shifts', req.params.id);
    res.json(shift);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function addMember(req: AuthRequest, res: Response) {
  try {
    const member = await service.addMember(req.params.id, req.body);
    await createAuditLog(req.user.id, 'ADD_SHIFT_MEMBER', 'shift_members', member.id);
    res.status(201).json(member);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function removeMember(req: AuthRequest, res: Response) {
  try {
    await service.removeMember(req.params.memberId);
    await createAuditLog(req.user.id, 'REMOVE_SHIFT_MEMBER', 'shift_members', req.params.memberId);
    res.json({ message: 'Removed' });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function getActive(_req: AuthRequest, res: Response) {
  try {
    const shift = await service.getActiveShift();
    if (!shift) return res.status(404).json({ error: 'No active shift' });
    res.json(shift);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const result = await service.deleteShift(req.params.id);
    await createAuditLog(req.user.id, 'DELETE_SHIFT', 'shifts', req.params.id);
    res.json(result);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}
