import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { ForbiddenError } from '../utils/errors';

export function adminMiddleware(req: Request, _res: Response, next: NextFunction) {
  const apiKey = req.headers['x-admin-key'];
  if (apiKey !== env.ADMIN_API_KEY) {
    return next(new ForbiddenError('API key de admin invalida'));
  }
  next();
}
