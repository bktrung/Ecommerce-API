import InventoryService from "../services/inventory.service";
import { CREATED } from "../core/success.response";

class InventoryController {
	addStockToInventory = async (req, res, next) => {
		new CREATED({
			message: "Add stock to inventory successfully",
			metadata: await InventoryService.addStockToInventory(req.body),
		}).send(res);
	}
}

export default new InventoryController();