function parseIntEx(i: number | string): number {
    i = parseInt(`${i}`);

    return isNaN(i) ? 0 : i;
}

export default parseIntEx;
