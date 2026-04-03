import { Router } from 'express';
import { adminMiddleware } from '../middleware/admin';
import {
  syncTeams,
  syncFixtures,
  syncPredictions,
  generateBetOptions,
  lockBets,
  resolveBets,
  recalculateLeaderboard,
} from '../controllers/admin.controller';

const router = Router();

router.use(adminMiddleware);

router.post('/admin/sync-teams', syncTeams);
router.post('/admin/sync-fixtures', syncFixtures);
router.post('/admin/sync-predictions', syncPredictions);
router.post('/admin/generate-bet-options', generateBetOptions);
router.post('/admin/lock-bets', lockBets);
router.post('/admin/resolve-bets', resolveBets);
router.post('/admin/recalculate-leaderboard', recalculateLeaderboard);

export default router;
