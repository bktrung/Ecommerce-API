import { Router } from "express";
import access from "./access/index.js";
import product from "./product/index.js";
const router = Router();

router.use("/v1/api/products", product);
router.use("/v1/api", access);

export default router;
