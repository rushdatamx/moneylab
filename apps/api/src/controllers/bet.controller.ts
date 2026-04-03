import { Request, Response, NextFunction } from 'express';
import { betService } from '../services/bet.service';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function placeBet(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const data = await betService.placeBet(userId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getMyBets(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const data = await betService.getMyBets(userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function cancelBet(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    await betService.cancelBet(userId, req.params.id);
    res.json({ data: { message: 'Apuesta cancelada' } });
  } catch (err) {
    next(err);
  }
}

export async function getFixtureLeagueBets(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const data = await betService.getFixtureLeagueBets(
      req.params.fid,
      req.params.lid,
      userId
    );
    res.json({ data });
  } catch (err) {
    next(err);
  }
}
