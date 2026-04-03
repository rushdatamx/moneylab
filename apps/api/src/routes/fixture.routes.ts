import { Router } from 'express';
import {
  getFixtures,
  getUpcoming,
  getLive,
  getFixtureById,
  getFixtureStatistics,
  getFixtureH2H,
  getFixturePredictions,
  getFixtureBetOptions,
} from '../controllers/fixture.controller';

const router = Router();

router.get('/fixtures', getFixtures);
router.get('/fixtures/upcoming', getUpcoming);
router.get('/fixtures/live', getLive);
router.get('/fixtures/:id', getFixtureById);
router.get('/fixtures/:id/statistics', getFixtureStatistics);
router.get('/fixtures/:id/h2h', getFixtureH2H);
router.get('/fixtures/:id/predictions', getFixturePredictions);
router.get('/fixtures/:id/bet-options', getFixtureBetOptions);

export default router;
