import { Router } from 'express';
import { login, signup, logout, deleteAccount } from '../controllers/auth';
import { currentUser, requireAuth } from '../middlewares';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

router.use(currentUser, requireAuth);
router.delete('/delete-account', deleteAccount);

export default router;
