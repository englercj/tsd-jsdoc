/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {object} Triforce
 * @property {boolean} hasCourage - Indicates whether the Courage component is present.
 * @property {boolean} hasPower - Indicates whether the Power component is present.
 * @property {boolean} hasWisdom - Indicates whether the Wisdom component is present.
 */
declare type Triforce = {
    hasCourage: boolean;
    hasPower: boolean;
    hasWisdom: boolean;
};

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef Anon
 * @property {boolean} hasCourage - Indicates whether the Courage component is present.
 * @property {boolean} hasPower - Indicates whether the Power component is present.
 * @property {boolean} hasWisdom - Indicates whether the Wisdom component is present.
 */
declare type Anon = {
    hasCourage: boolean;
    hasPower: boolean;
    hasWisdom: boolean;
};

/**
 * @typedef {object} GitGraphOptions
 * @property {string} [elementId = "gitGraph"] - Id of the canvas container
 * @property {Template|string|Object} [template] - Template of the graph
 * @property {string} [author = "Sergio Flores <saxo-guy@epic.com>"] - Default author for commits
 * @property {string} [mode = (null|"compact")]  - Display mode
 * @property {HTMLElement} [canvas] - DOM canvas (ex: document.getElementById("id"))
 * @property {string} [orientation = ("vertical-reverse"|"horizontal"|"horizontal-reverse")] - Graph orientation
 * @property {boolean} [reverseArrow = false] - Make arrows point to ancestors if true
 * @property {number} [initCommitOffsetX = 0] - Add custom offsetX to initial commit.
 * @property {number} [initCommitOffsetY = 0] - Add custom offsetY to initial commit.
 * @property {HTMLElement} [tooltipContainer = document.body] - HTML Element containing tooltips in compact mode.
 */
declare type GitGraphOptions = {
    elementId?: string;
    template?: any | string | any;
    author?: string;
    mode?: string;
    canvas?: HTMLElement;
    orientation?: string;
    reverseArrow?: boolean;
    initCommitOffsetX?: number;
    initCommitOffsetY?: number;
    tooltipContainer?: HTMLElement;
};

/**
 * A number, or a string containing a number.
 * @typedef {(number|string)} NumberLike
 */
declare type NumberLike = number | string;

