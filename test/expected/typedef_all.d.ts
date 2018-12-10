declare type Triforce = {
    hasCourage: boolean;
    hasPower: boolean;
    hasWisdom: boolean;
};

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

declare type NumberLike = number | string;

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
};

