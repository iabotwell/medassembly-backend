import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as authService from './auth.service';

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.loginWithPassword(req.body.email, req.body.password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function requestOtp(req: Request, res: Response) {
  try {
    const result = await authService.requestOtp(req.body.email);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const result = await authService.verifyOtp(req.body.email, req.body.code);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function firebaseLogin(req: Request, res: Response) {
  try {
    const result = await authService.loginWithFirebase(req.body.idToken);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const tokens = await authService.refreshAccessToken(req.body.refreshToken);
    res.json(tokens);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function logout(_req: Request, res: Response) {
  res.json({ message: 'Logged out' });
}

export async function me(req: AuthRequest, res: Response) {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}
