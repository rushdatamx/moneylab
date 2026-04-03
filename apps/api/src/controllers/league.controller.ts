import { Request, Response, NextFunction } from 'express';
import { leagueService } from '../services/league.service';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function createLeague(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { name, credits_per_match } = req.body;
    const data = await leagueService.create(userId, name, credits_per_match);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function joinLeague(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { invitation_code } = req.body;
    const data = await leagueService.join(userId, invitation_code);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getMyLeagues(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const data = await leagueService.getMyLeagues(userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const data = await leagueService.getLeaderboard(req.params.id, userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}
