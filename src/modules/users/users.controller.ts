import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as usersService from './users.service';
import { createAuditLog } from '../../utils/helpers';

export async function list(req: Request, res: Response) {
  try {
    const { role, isActive } = req.query;
    const users = await usersService.listUsers({
      role: role as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const user = await usersService.createUser(req.body);
    await createAuditLog(req.user.id, 'CREATE_USER', 'users', user.id);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const user = await usersService.updateUser(req.params.id, req.body);
    await createAuditLog(req.user.id, 'UPDATE_USER', 'users', req.params.id);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function toggle(req: AuthRequest, res: Response) {
  try {
    const user = await usersService.toggleUser(req.params.id);
    await createAuditLog(req.user.id, 'TOGGLE_USER', 'users', req.params.id);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
