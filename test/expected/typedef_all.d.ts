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
 * @property {object} thing
 * @property {object} thing.a
 * @property {object} thing.a.b
 * @property {object} thing.a.b.c
 * @property {number} thing.b
 */
declare type Anon = {
    hasCourage: boolean;
    hasPower: boolean;
    hasWisdom: boolean;
    thing: {
        a: {
            b: {
                c: any;
            };
        };
        b: number;
    };
};

/**
 *
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
    template?: Template | string | any;
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

/**
 * @typedef {Object} PatternOptions
 *
 * @property {Object} pattern Holds a pattern definition.
 * @property {String} pattern.image URL to an image to use as the pattern.
 * @property {Number} pattern.width Width of the pattern. For images this is
 *  automatically set to the width of the element bounding box if not supplied.
 *  For non-image patterns the default is 32px. Note that automatic resizing of
 *  image patterns to fill a bounding box dynamically is only supported for
 *  patterns with an automatically calculated ID.
 * @property {Number} pattern.height Analogous to pattern.width.
 * @property {Number} pattern.aspectRatio For automatically calculated width and
 *  height on images, it is possible to set an aspect ratio. The image will be
 *  zoomed to fill the bounding box, maintaining the aspect ratio defined.
 * @property {Number} pattern.x Horizontal offset of the pattern. Defaults to 0.
 * @property {Number} pattern.y Vertical offset of the pattern. Defaults to 0.
 * @property {Object|String} pattern.path Either an SVG path as string, or an
 *  object. As an object, supply the path string in the `path.d` property. Other
 *  supported properties are standard SVG attributes like `path.stroke` and
 *  `path.fill`. If a path is supplied for the pattern, the `image` property is
 *  ignored.
 * @property {String} pattern.color Pattern color, used as default path stroke.
 * @property {Number} pattern.opacity Opacity of the pattern as a float value
 *     from 0 to 1.
 * @property {String} pattern.id ID to assign to the pattern. This is
 *    automatically computed if not added, and identical patterns are reused. To
 *    refer to an existing pattern for a Highcharts color, use
 *    `color: "url(#pattern-id)"`.
 * @property {Object|Boolean} animation Animation options for the image pattern
 *  loading.
 * Note: doesn't matter what I put, a @property only gets "FUNCTION" from jsdoc
 * @property {function(number): void} rotate Rotates the pattern by degrees
 * @property {function} wiggle Wiggles the pattern (default function)
 * @property {function(string, number): Promise<number>} wobble Wobbles the pattern
 *  (complex function)
 */
declare type PatternOptions = {
    pattern: {
        image: string;
        width: number;
        height: number;
        aspectRatio: number;
        x: number;
        y: number;
        path: any | string;
        color: string;
        opacity: number;
        id: string;
    };
    animation: any | boolean;
    rotate: (...params: any[]) => any;
    wiggle: (...params: any[]) => any;
    wobble: (...params: any[]) => any;
};


