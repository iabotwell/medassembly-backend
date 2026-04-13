import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './whatsapp.service';

export async function listTemplates(_req: AuthRequest, res: Response) {
  try { res.json(await service.listTemplates()); } catch (err: any) { res.status(500).json({ error: err.message }); }
}

export async function updateTemplate(req: AuthRequest, res: Response) {
  try { res.json(await service.updateTemplate(req.params.id, req.body)); } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function sendMessage(req: AuthRequest, res: Response) {
  try {
    await service.sendWhatsApp(req.body.phone, req.body.message);
    res.json({ message: 'Sent' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
}

export async function getStatus(_req: AuthRequest, res: Response) {
  try { res.json(await service.getConnectionStatus()); } catch (err: any) { res.status(500).json({ error: err.message }); }
}
