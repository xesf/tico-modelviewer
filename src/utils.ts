/* eslint-disable no-underscore-dangle */

export function bits(bitfield: number, offset: number, length: number) : number {
    return (bitfield & ((((1 << length) - 1)) << offset)) >> offset;
}

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

interface MetaFunction extends Function {
    __param_names: any;
    __pure_function: boolean;
    __location: string;
}

export function getParamNames(func: MetaFunction) {
    if (func.__param_names) {
        return func.__param_names;
    }
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

export function sBind(fct: MetaFunction, thisValue: any, ...args: any) {
    const tgt = fct.bind(thisValue, ...args);
    const paramNames = getParamNames(fct);
    if (paramNames && paramNames.length > 0)
        tgt.__param_names = paramNames.slice(args.length);
    if (fct.__pure_function) {
        tgt.__pure_function = fct.__pure_function;
    }
    if (fct.__location) {
        tgt.__location = fct.__location;
    }
    return tgt;
}
