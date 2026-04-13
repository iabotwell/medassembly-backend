import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './triage.service';
import { createAuditLog } from '../../utils/helpers';

export async function listQuestions(req: AuthRequest, res: Response) {
  try {
    const includeInactive = req.query.all === 'true';
    res.json(await service.listQuestions(includeInactive));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
}

export async function deleteQuestion(req: AuthRequest, res: Response) {
  try {
    await service.deleteQuestion(req.params.id);
    await createAuditLog(req.user.id, 'DELETE_TRIAGE_QUESTION', 'triage_questions', req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function createQuestion(req: AuthRequest, res: Response) {
  try {
    const q = await service.createQuestion(req.body);
    await createAuditLog(req.user.id, 'CREATE_TRIAGE_QUESTION', 'triage_questions', q.id);
    res.status(201).json(q);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function updateQuestion(req: AuthRequest, res: Response) {
  try {
    const q = await service.updateQuestion(req.params.id, req.body);
    await createAuditLog(req.user.id, 'UPDATE_TRIAGE_QUESTION', 'triage_questions', req.params.id);
    res.json(q);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function toggleQuestion(req: AuthRequest, res: Response) {
  try {
    const q = await service.toggleQuestion(req.params.id);
    res.json(q);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function performTriage(req: AuthRequest, res: Response) {
  try {
    const triage = await service.performTriage(req.params.id, { ...req.body, performedBy: req.user.id });
    await createAuditLog(req.user.id, 'TRIAGE', 'patients', req.params.id, { color: req.body.color });
    res.status(201).json(triage);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}

export async function updateTriage(req: AuthRequest, res: Response) {
  try {
    const triage = await service.updateTriage(req.params.id, req.body);
    await createAuditLog(req.user.id, 'UPDATE_TRIAGE', 'patients', req.params.id);
    res.json(triage);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
}
