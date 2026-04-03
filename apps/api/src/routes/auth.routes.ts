import { Router } from 'express';
import { register, getProfile, updateProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/auth/register', register);
router.get('/profile/me', authMiddleware, getProfile);
router.patch('/profile/me', authMiddleware, updateProfile);

export default router;
