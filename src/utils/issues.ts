export function issueTemplateModels(
    fields: Record<string, unknown>,
    initialValues: Record<string, string> = {},
): Record<string, string> {
    const models: Record<string, string> = {};

    Object.values(fields).forEach(field => {
        if (typeof field !== 'string' || ['project', 'workflow', 'catalog'].includes(field))
            return;
        models[field] = initialValues[field] || '';
    });

    return models;
}
