import { Request, Response, NextFunction } from 'express';
import { fixtureService } from '../services/fixture.service';

export async function getFixtures(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await fixtureService.getFixtures(req.query as any);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getUpcoming(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const data = await fixtureService.getUpcoming(limit);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getLive(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await fixtureService.getLive();
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getFixtureById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await fixtureService.getById(req.params.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getFixtureStatistics(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await fixtureService.getStatistics(req.params.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getFixtureH2H(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await fixtureService.getH2H(req.params.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getFixturePredictions(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await fixtureService.getPredictions(req.params.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getFixtureBetOptions(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await fixtureService.getBetOptions(req.params.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}
