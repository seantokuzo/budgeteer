import { Router } from 'express';
import { uploadTransactions } from '../controllers/budget';
import { currentUser, requireAuth } from '../middlewares';

const router = Router();

router.use(currentUser, requireAuth);
router.delete('/upload-transactions', uploadTransactions);

export default router;
