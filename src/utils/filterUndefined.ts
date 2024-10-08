const filterUndefined = (obj: Record<string, string | undefined>): Record<string, string> => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined) as [string, string][]
    );
};

export default filterUndefined