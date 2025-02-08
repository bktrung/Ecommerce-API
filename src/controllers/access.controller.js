import AccessService from '../services/access.service.js';
import { CREATED, OK } from "../core/success.response.js";

class AccessController {
    signUp = async (req, res, next) => {
        const metadata = await AccessService.signUp(req.body);
		CREATED.send({
			res,
			message: "Shop registered successfully",
			metadata,
		});
    }

	refreshToken = async (req, res, next) => {
		const { refreshToken } = req.body;
		const metadata = await AccessService.refreshToken(refreshToken);
		OK.send({
			res,
			message: "Token refreshed successfully",
			metadata,
		});
    }
}

export default new AccessController();