import { Router } from "express";
import access from "./access/index.js";
import product from "./product/index.js";
import discount from "./discount/index.js";
import cart from "./cart/index.js";
import comment from "./comment/index.js";
import { pushLogToDiscord } from "../middlewares/index.js";
import { apiKey, permission } from "../auth/authUtils.js";

const router = Router();

router.use(pushLogToDiscord);

router.use(apiKey);
router.use(permission("0000"));

router.use("/v1/api/products", product);
router.use("/v1/api/discounts", discount);
router.use("/v1/api/cart", cart);
router.use("/v1/api", access);
router.use("/v1/api/comments", comment);

export default router;