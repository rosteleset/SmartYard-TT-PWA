export function availableIssueWorkflows(
    project: Project | undefined,
    workflows: Workflows | undefined,
): string[] {
    if (!project || !workflows)
        return [];

    return (project.workflows || []).filter(key => {
        const workflow = workflows[key];
        return Boolean(workflow && Object.values(workflow.catalog || {})
            .some(group => Object.keys(group || {}).length > 0));
    });
}

export function availableIssueProjects(
    projects: Project[] | undefined,
    workflows: Workflows | undefined,
): Project[] {
    return (projects || []).filter(project =>
        availableIssueWorkflows(project, workflows).length > 0
    );
}

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
