import { Router } from "express";
import access from "./access/index.js";
import product from "./product/index.js";
const router = Router();

router.use("/v1/api", access);
router.use("/v1/api/products", product);

export default router;
