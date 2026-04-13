import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as eventsService from './events.service';
import { createAuditLog } from '../../utils/helpers';

export async function list(_req: AuthRequest, res: Response) {
  try {
    res.json(await eventsService.listEvents());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const event = await eventsService.createEvent(req.body);
    await createAuditLog(req.user.id, 'CREATE_EVENT', 'events', event.id);
    res.status(201).json(event);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const event = await eventsService.updateEvent(req.params.id, req.body);
    await createAuditLog(req.user.id, 'UPDATE_EVENT', 'events', req.params.id);
    res.json(event);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function activate(req: AuthRequest, res: Response) {
  try {
    const event = await eventsService.activateEvent(req.params.id);
    await createAuditLog(req.user.id, 'ACTIVATE_EVENT', 'events', req.params.id);
    res.json(event);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function getActive(_req: AuthRequest, res: Response) {
  try {
    const event = await eventsService.getActiveEvent();
    if (!event) return res.status(404).json({ error: 'No active event' });
    res.json(event);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
