import { Router } from 'express';
import {
  googleLogin,
  login,
  signup,
  confirmSignup,
  logout,
  deleteAccount,
  forgotPassword,
  resetPassword,
} from '../controllers/auth';
import { currentUser, requireAuth } from '../middlewares';

const router = Router();

// VANILLA AUTH
router.post('/gogo/signup', signup);
router.get('/gogo/confirm', confirmSignup);
router.post('/gogo/login', login);

// GOOGLE OAUTH2
router.get('/google/login', googleLogin);

// FACEBOOK OAUTH2
// router.get('/facebook/login', facebookLogin)

// APPLE OAUTH2
// router.get('/apple/login', appleLogin)

// DISCORD OAUTH2
// router.get('/discord/login', appleLogin)
router.post('/gogo/forgot-password', forgotPassword);
router.post('/gogo/reset-password', resetPassword);

router.post('/logout', logout);

router.use(currentUser, requireAuth);

router.delete('/delete-account', deleteAccount);

export default router;
