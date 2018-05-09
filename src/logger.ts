export const enum EResolveFailure {
    Memberof,
    Object,
    NoType,
    Augments,
    FunctionParam,
    FunctionReturn,
}

export function warn(...args: any[]) {
    args.unshift('[TSD-JSDoc]');
    return console && console.warn.apply(console, args);
}

export function warnResolve(doclet: TDoclet, reason: EResolveFailure, message: string = '') {
    let str = '';

    switch (reason) {
        case EResolveFailure.Memberof:
            str = `Unable to resolve memberof for "${doclet.longname}", using memberof "${doclet.memberof}".`;
            break;

        case EResolveFailure.Object:
            str = `Unable to find object for longname "${doclet.longname}".`;
            break;

        case EResolveFailure.NoType:
            str = `Type is required for doclet of type "${doclet.kind}" but none found for "${doclet.longname}".`;
            break;

        case EResolveFailure.Augments:
            str = `Failed to resolve base type of "${doclet.longname}", no object found with name "${(doclet as any).augments[0]}".`;
            break;

        case EResolveFailure.FunctionParam:
            str = `Unable to resolve function param type for longname "${doclet.longname}".`;
            break;

        case EResolveFailure.FunctionReturn:
            str = `Unable to resolve function return type for longname "${doclet.longname}".`;
            break;
    }

    if (message) {
        str += ` ${message}`;
    }

    warn(str);
}
