import { Router } from 'express';
import { updateUsername } from '../controllers/user';
import { currentUser, requireAuth } from '../middlewares';

const router = Router();

router.use(currentUser, requireAuth);
router.delete('/update-username', updateUsername);

export default router;
