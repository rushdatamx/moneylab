import { Router } from 'express';
import { createLeague, joinLeague, getMyLeagues, getLeaderboard } from '../controllers/league.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/leagues', authMiddleware, createLeague);
router.post('/leagues/join', authMiddleware, joinLeague);
router.get('/leagues', authMiddleware, getMyLeagues);
router.get('/leagues/:id/leaderboard', authMiddleware, getLeaderboard);

export default router;
