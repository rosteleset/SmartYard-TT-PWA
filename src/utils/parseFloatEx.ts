function parseFloatEx(f: number | string, r?: number | false): number {
    f = parseFloat(`${f}`.toString().replaceAll(",", "."));

    if (r !== false && typeof r !== "undefined") {
        f = Math.round(f * (10 ** r)) / (10 ** r);
    }

    return isNaN(f) ? 0 : f;
}

export default parseFloatEx