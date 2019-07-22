/**
 * Checks if specified object is empty, i.e. contains no properties.
 * Doesn't work for array.
 *
 * @param {Object} obj
 * @return {boolean} true if object is empty.
 */
export function isEmptyObject(obj) {
  return Boolean(obj && typeof obj === 'object' &&
    !Array.isArray(obj) && Object.keys(obj).length === 0);
}
