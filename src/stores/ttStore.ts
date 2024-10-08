import api from "@/utils/api";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTtStore = defineStore('tt', () => {

    // state
    const meta = ref<Meta>()
    const project = ref<Project>()
    const filter = ref<FilterWithLabel>()

    // actions
    const load = async () => {
        return api.GET('tt/tt')
            .then(res => {
                meta.value = res.meta
            });
    }

    const getProjectByAcronym = (acronym: string): Project => {
        const project = meta.value?.projects.find(p => p.acronym === acronym)
        if (!project)
            throw new Error('Project not found')
        return project
    }

    const getFilterWithLabel = (filter: string, _project?: Project): FilterWithLabel => {
        const currentProject = _project || project.value
        if (!currentProject)
            throw new Error('Project not found')
        const _filter = currentProject.filters.find(f => f.filter === filter)
        const label = meta.value?.filters[filter]
        if (!_filter || !label)
            throw new Error('Filter not found')
        return { ...{ label }, ..._filter }
    }

    const getIssues = async ({ project: _project = project.value?.acronym, filter: _filter = filter.value?.filter, limit, skip, search }: { limit: number, skip: number, project?: string, filter?: string, search?: string }): Promise<DataStructure> => {

        if (!_project)
            return Promise.reject('Project not selected')

        if (!_filter && !search)
            return Promise.reject('Filter not selected')

        try {
            const params: Record<string, string | undefined> = {
                project: _project,
                filter: _filter,
                skip: skip.toString(),
                limit: limit.toString(),
            }
            if (search) {
                params.filter = '#search'
                params.search = search
            }
            const res = await api.GET('tt/issues', params)

            return res.issues
        } catch (err) {
            return Promise.reject(err)
        }
    }

    const getIssue = async (issueId: string): Promise<IssueData> => {
        try {
            const res = await api.GET(`tt/issue/${issueId}`)
            return res.issue
        } catch (err) {
            return Promise.reject(err)
        }
    }

    return {
        meta,
        project,
        filter,
        load,
        getProjectByAcronym,
        getFilterWithLabel,
        getIssues,
        getIssue
    }
})