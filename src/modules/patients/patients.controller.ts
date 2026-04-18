import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as service from './patients.service';
import { createAuditLog } from '../../utils/helpers';
import prisma from '../../config/database';

export async function list(req: AuthRequest, res: Response) {
  try {
    const { eventId, status, triageColor } = req.query;
    const patients = await service.listPatients({
      eventId: eventId as string,
      status: status as string,
      triageColor: triageColor as string,
    });
    res.json(patients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const activeEvent = await prisma.event.findFirst({ where: { isActive: true } });
    if (!activeEvent) return res.status(400).json({ error: 'No active event' });

    const patient = await service.createPatient(activeEvent.id, req.body);
    await createAuditLog(req.user.id, 'CREATE_PATIENT', 'patients', patient.id);
    res.status(201).json(patient);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function getDetail(req: AuthRequest, res: Response) {
  try {
    const patient = await service.getPatientDetail(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const patient = await service.updatePatient(req.params.id, req.body);
    await createAuditLog(req.user.id, 'UPDATE_PATIENT', 'patients', req.params.id);
    res.json(patient);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const result = await service.deletePatient(req.params.id);
    await createAuditLog(req.user.id, 'DELETE_PATIENT', 'patients', req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateStatus(req: AuthRequest, res: Response) {
  try {
    const patient = await service.updatePatientStatus(req.params.id, req.body.status);
    await createAuditLog(req.user.id, 'UPDATE_PATIENT_STATUS', 'patients', req.params.id, { status: req.body.status });
    res.json(patient);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function getQueue(req: AuthRequest, res: Response) {
  try {
    const activeEvent = await prisma.event.findFirst({ where: { isActive: true } });
    if (!activeEvent) return res.status(400).json({ error: 'No active event' });
    const queue = await service.getQueue(activeEvent.id);
    res.json(queue);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
