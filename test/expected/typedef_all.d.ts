declare module "typedefs" {
    /**
     * The complete Triforce, or one or more components of the Triforce.
     */
    type Triforce = {
        /**
         * Indicates whether the Courage component is present.
         */
        hasCourage: boolean;
        /**
         * Indicates whether the Power component is present.
         */
        hasPower: boolean;
        /**
         * Indicates whether the Wisdom component is present.
         */
        hasWisdom: boolean;
    };
    /**
     * The complete Triforce, or one or more components of the Triforce.
     */
    type Anon = {
        /**
         * Indicates whether the Courage component is present.
         */
        hasCourage: boolean;
        /**
         * Indicates whether the Power component is present.
         */
        hasPower: boolean;
        /**
         * Indicates whether the Wisdom component is present.
         */
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
     */
    type GitGraphOptions = {
        /**
         * Id of the canvas container
         * @defaultValue "gitGraph"
         */
        elementId?: string;
        /**
         * Template of the graph
         */
        template?: Template | string | any;
        /**
         * Default author for commits
         * @defaultValue "Sergio Flores <saxo-guy@epic.com>"
         */
        author?: string;
        /**
         * Display mode
         * @defaultValue (null|"compact")
         */
        mode?: string;
        /**
         * DOM canvas (ex: document.getElementById("id"))
         */
        canvas?: HTMLElement;
        /**
         * Graph orientation
         * @defaultValue ("vertical-reverse"|"horizontal"|"horizontal-reverse")
         */
        orientation?: string;
        /**
         * Make arrows point to ancestors if true
         */
        reverseArrow?: boolean;
        /**
         * Add custom offsetX to initial commit.
         */
        initCommitOffsetX?: number;
        /**
         * Add custom offsetY to initial commit.
         */
        initCommitOffsetY?: number;
        /**
         * HTML Element containing tooltips in compact mode.
         * @defaultValue document.body
         */
        tooltipContainer?: HTMLElement;
    };
    /**
     * A number, or a string containing a number.
     */
    type NumberLike = number | string;
    /**
     */
    type PatternOptions = {
        /**
         * Holds a pattern definition.
         */
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
        /**
         * Animation options for the image pattern
         loading.
        Note: doesn't matter what I put, a @property only gets "FUNCTION" from jsdoc
         */
        animation: any | boolean;
        /**
         * Rotates the pattern by degrees
         */
        rotate: (...params: any[]) => any;
        /**
         * Wiggles the pattern (default function)
         */
        wiggle: (...params: any[]) => any;
        /**
         * Wobbles the pattern
         (complex function)
         */
        wobble: (...params: any[]) => any;
    };
}
