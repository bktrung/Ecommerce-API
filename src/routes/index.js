import { Router } from "express";
import access from './access/index.js';
const router = Router();

router.use('/v1/api', access);

export default router;