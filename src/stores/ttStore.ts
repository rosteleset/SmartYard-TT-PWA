import { defineStore } from "pinia";
import { computed, ref } from "vue";
import api from "@/utils/api";

export const useTtStore = defineStore('tt', () => {
    // state
    const meta = ref<Meta>()
    const project = ref<Project>()

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

    const getIssues = async (limit: number, filter: string, skip: number): Promise<DataStructure> => {
        if (!project.value || !filter)
            return Promise.reject()
        try {
            const res = await api.GET('tt/issues', {
                project: project.value?.acronym,
                filter: filter,
                skip: skip.toString(),
                limit: limit.toString()
            })

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
        load,
        getProjectByAcronym,
        getFilterWithLabel,
        getIssues,
        getIssue
    }
})