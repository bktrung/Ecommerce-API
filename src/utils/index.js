import pick from 'lodash/pick.js';

/**
 * Extracts specific fields from an object
 * @param {Object} params - The parameters object
 * @param {string[]} [params.fields=[]] - Array of field names to extract
 * @param {Object} [params.object={}] - Source object to extract fields from
 * @returns {Object} New object containing only the specified fields
 */
const getInfoData = ({ fields=[], object={} }) => {
    return pick(object, fields);
}

export { getInfoData }