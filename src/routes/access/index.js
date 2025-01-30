import { Router } from 'express';
import AccessController from '../../controllers/access.controller.js';
const router = Router();

// signUp
router.post('/shop/signup', AccessController.signUp);
router.post('/shop/refresh-token', AccessController.refreshToken);

export default router;