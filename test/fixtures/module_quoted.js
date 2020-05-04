/** @module "1.0/array-to-object-keys" */

/**
 * @typedef valueGenerator
 * @type {function}
 * @param {string} value The original array entry
 * @param {number} index The index of the array entry (starts at 0)
 * @returns {*}
 */

/**
 * Converts an array to an object with static keys and customizable values
 * @example
 * arrayToObjectKeys(["a", "b"])
 * // {a: null, b: null}
 * @example
 * arrayToObjectKeys(["a", "b"], "value")
 * // {a: "value", b: "value"}
 * @example
 * arrayToObjectKeys(["a", "b"], (key, index) => `value for ${key} #${index + 1}`)
 * // {a: "value for a #1", b: "value for b #2"}
 * @param {string[]} array Keys for the generated object
 * @param {valueGenerator|*} [valueGenerator=null] Optional function that sets the object values based on key and index
 * @returns {Object<string, *>} A generated object based on the array input
 */
const arrayToObjectKeys = (array, valueGenerator = null) => {
}

export default arrayToObjectKeys
