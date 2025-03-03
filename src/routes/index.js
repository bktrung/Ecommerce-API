import { Router } from "express";
import access from "./access/index.js";
import product from "./product/index.js";
import discount from "./discount/index.js";
import cart from "./cart/index.js";
import { pushLogToDiscord } from "../middlewares/index.js";

const router = Router();

router.use(pushLogToDiscord);

router.use("/v1/api/products", product);
router.use("/v1/api/discounts", discount);
router.use("/v1/api/cart", cart);
router.use("/v1/api", access);

export default router;