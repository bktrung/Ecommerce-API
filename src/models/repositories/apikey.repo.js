import apiKey from "../apikey.model.js";
import crypto from "crypto";

export const findByKey = async (key) => {
	return await apiKey.findOne({ key, status: true }).lean();
}