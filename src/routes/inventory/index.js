import { Router } from 'express';
import inventoryController from '../../controllers/inventory.controller.js';
import { asyncHandler } from '../../helpers/asyncHandler.js';
import { authentication } from '../../auth/authUtils.js';

const router = Router();

router.use(authentication);

router.post('', asyncHandler(inventoryController.addStockToInventory));

export default router;