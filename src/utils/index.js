import pick from "lodash/pick.js";

/**
 * @function getInfoData
 * @description Extracts and returns specified fields from a source object
 * - Uses lodash pick to safely extract fields
 * - Returns new object with only requested fields
 * - Handles empty inputs gracefully with defaults
 * 
 * @param {Object} params Input parameters object 
 * @param {string[]} [params.fields=[]] Array of field names to extract
 * @param {Object} [params.object={}] Source object to extract fields from
 * @returns {Object} New object containing only the specified fields
 */
export const getInfoData = ({ fields=[], object={} }) => {
    return pick(object, fields);
}

/*
// export const removeUndefinedObject = (obj = {}) => {
// 	Object.keys(obj).forEach((key) => {
// 		if (
// 			obj[key] &&
// 			typeof obj[key] === "object" &&
// 			!Array.isArray(obj[key])
// 		) {
// 			removeUndefinedObject(obj[key]);
// 		} else if (obj[key] == null) {
// 			delete obj[key];
// 		}
// 	});
// 	return obj;
// }; // Here is my origin code, below is imporved version created by genAI
*/

/**
 * @function removeUndefinedObject
 * @description Recursively removes null/undefined properties from an object
 * - Handles nested object structures recursively
 * - Removes properties with null/undefined values
 * - Preserves arrays and primitive values
 * - Cleans nested objects, removing empty objects
 * - Handles invalid inputs safely
 * 
 * @param {Object} obj Input object to clean
 * @returns {Object} New object with null/undefined properties removed
 */
export const removeUndefinedObject = (obj = {}) => {
	// Return early if input is not an object or is null
	if (typeof obj !== "object" || obj === null) {
		return obj;
	}

	// Reduce object entries to new object, removing undefined values
	return Object.entries(obj).reduce((acc, [key, value]) => {
		// Skip null or undefined values
		if (value === null || value === undefined) {
			return acc;
		}

		// Handle nested objects recursively
		if (typeof value === "object" && !Array.isArray(value)) {
			const cleaned = removeUndefinedObject(value);
			// Only add nested object if it has properties
			if (Object.keys(cleaned).length > 0) {
				acc[key] = cleaned;
			}
			return acc;
		}

		// Add non-object values directly
		acc[key] = value;
		return acc;
	}, {});
};

/*
// export const updateNestedObjectParser = (obj = {}) => {
// 	const final = {};
// 	Object.keys(obj).forEach((key) => {
// 		if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
// 			const response = updateNestedObjectParser(obj[key]);
// 			Object.keys(response).forEach((k) => {
// 				final[`${key}.${k}`] = response[k];
// 			});
// 		} else {
// 			final[key] = obj[key];
// 		}
// 	});
// 	return final;
// }; // Here is my origin code, below is imporved version created by genAI
*/

/**
 * @function updateNestedObjectParser
 * @description Transforms nested objects into flattened format with dot notation
 * - Handles nested object structures recursively
 * - Converts nested keys into dot notation format
 * - Preserves arrays and primitive values
 * - Skips undefined values
 * - Handles invalid inputs safely
 * 
 * @param {Object} obj Input object to flatten
 * @param {string} [parentKey=""] Parent key for nested object processing
 * @returns {Object} Flattened object with dot notation keys
 * 
 * @example { address: { city: 'NY', zip: '10001' } } -> { 'address.city': 'NY', 'address.zip': '10001' }
 */
export const updateNestedObjectParser = (obj = {}, parentKey = "") => {
	// Return empty object for invalid inputs
	if (typeof obj !== "object" || obj === null) {
		return {};
	}

	// Reduce object entries into flattened structure
	return Object.entries(obj).reduce((acc, [key, value]) => {
		// Create new key with dot notation
		const newKey = parentKey ? `${parentKey}.${key}` : key;

		// Handle nested objects recursively
		if (value && typeof value === "object" && !Array.isArray(value)) {
			Object.assign(acc, updateNestedObjectParser(value, newKey));
		}
		// Handle non-object values
		else if (value !== undefined) {
			acc[newKey] = value;
		}

		return acc;
	}, {});
};

export const getAllDocuments = async (
	model,
	{ limit, sort, page, filter, select }
) => {
	const skip = (page - 1) * limit;

	// _id is better than createdAt in single-criteria sorting in MongoDB
	const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };

	// Add total count for pagination
	const [documents, totalCount] = await Promise.all([
		model
			.find(filter)
			.sort(sortBy)
			.limit(limit)
			.skip(skip)
			.select(select)
			.lean(),
		model.countDocuments(filter),
	]);

	return {
		pagination: {
			total: totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit),
		},
		documents,
	};
}