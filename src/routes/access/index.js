import { Router } from 'express';
import AccessController from '../../controllers/access.controller.js';
import { asyncHandler } from '../../helpers/asyncHandler.js';
const router = Router();

// signUp
router.post('/shop/signup', asyncHandler(AccessController.signUp));
router.post("/shop/refresh-token", asyncHandler(AccessController.refreshToken));

export default router;