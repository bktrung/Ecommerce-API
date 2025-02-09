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
		const metadata = await AccessService.refreshToken(req.body);
		OK.send({
			res,
			message: "Token refreshed successfully",
			metadata,
		});
    }

	login = async (req, res, next) => {
		const metadata = await AccessService.login(req.body);
		OK.send({
			res,
			message: "Shop logged in successfully",
			metadata,
		});
	}

	logout = async (req, res, next) => {
		await AccessService.logout(req.keyToken);
		OK.send({
			res,
			message: "Shop logged out successfully",
		});
	}
}

export default new AccessController();