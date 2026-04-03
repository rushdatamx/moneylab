import { Router } from 'express';
import { placeBet, getMyBets, cancelBet, getFixtureLeagueBets } from '../controllers/bet.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/bets', authMiddleware, placeBet);
router.get('/bets/my', authMiddleware, getMyBets);
router.delete('/bets/:id', authMiddleware, cancelBet);
router.get('/bets/fixture/:fid/league/:lid', authMiddleware, getFixtureLeagueBets);

export default router;
