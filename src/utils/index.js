import pick from 'lodash/pick.js';

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
const getInfoData = ({ fields=[], object={} }) => {
    return pick(object, fields);
}

export { getInfoData }