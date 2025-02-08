import AccessService from '../services/access.service.js';

class AccessController {
    signUp = async (req, res, next) => {
        return res.status(201).json(await AccessService.signUp(req.body));
    }

	refreshToken = async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
            const result = await AccessService.refreshToken(refreshToken);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default new AccessController();