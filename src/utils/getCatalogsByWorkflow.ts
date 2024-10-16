const getCatalogsByWorkflow = (workflow: Workflow) => {
    const catalogs = []
    for (const key in workflow.catalog) {
        catalogs.push({
            value: key,
            disabled: true
        })
        for (const id in workflow.catalog[key]) {
            catalogs.push({
                value: workflow.catalog[key][id],
                disabled: false
            })
        }
    }
    return catalogs
}

export default getCatalogsByWorkflow