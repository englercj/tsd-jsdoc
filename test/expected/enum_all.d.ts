/** @module enums
 */
declare module "enums" {
    /**
     * Enum for tri-state values.
     * @readonly
     * @enum {number}
     */
    enum triState {
        TRUE = 1,
        FALSE = -1,
        MAYBE = true
    }
}
