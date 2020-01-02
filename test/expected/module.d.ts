declare module "array-to-object-keys" {
    /**
     * @param value - The original array entry
     * @param index - The index of the array entry (starts at 0)
     */
    type valueGenerator = (value: string, index: number) => any;
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
     * @param array - Keys for the generated object
     * @param [valueGenerator = null] - Optional function that sets the object values based on key and index
     * @returns A generated object based on the array input
     */
    function arrayToObjectKeys(array: string[], valueGenerator?: valueGenerator | any): {
        [key: string]: any;
    };
}
