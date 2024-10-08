import useAlert from "@/hooks/useAlert";
import api from "@/utils/api";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTtStore = defineStore('tt', () => {

    const { presentAlert } = useAlert()

    // state
    const meta = ref<Meta>()
    const project = ref<Project>()
    const filter = ref<FilterWithLabel>()
    const issue = ref<IssueData>()

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

    const getIssue = async (issueId: string, save?: boolean): Promise<IssueData> => {
        try {
            const res = await api.GET(`tt/issue/${issueId}`)
            if (save)
                issue.value = res.issue
            return res.issue
        } catch (err) {
            return Promise.reject(err)
        }
    }

    const updateIssue = () => {
        if (issue.value)
            return getIssue(issue.value.issue.issueId, true)
        else
            return Promise.reject()
    }

    const addComment = async (comment: string, commentPrivate: boolean, issueId?: string) => {
        const result = await api.POST('tt/comment', {
            issueId: issueId || issue.value?.issue.issueId,
            comment,
            commentPrivate
        })
        return result
    }

    const editComment = (comment: string, commentPrivate: boolean, commentIndex: number) => {
        return api.PUT('tt/comment', { issueId: issue.value?.issue.issueId, comment, commentPrivate, commentIndex })
    }

    const addAttachment = (attachment: any) => {

        return api.POST('tt/file', { issueId: issue.value?.issue.issueId, attachments: [attachment] })
    }

    const doAction = async ({ action, set, issueId }: { action: string, set?: any, issueId?: string }) => {
        try {
            return await api.PUT(`tt/action/${issueId || issue.value?.issue.issueId}`, {
                action,
                set
            });
        } catch (error: any) {
            presentAlert({
                header: 'Не удалось выполнить действие',
                message: error.message,
                buttons: ['Ok'],
            })
        }
    }

    return {
        meta,
        project,
        filter,
        issue,
        load,
        getProjectByAcronym,
        getFilterWithLabel,
        getIssues,
        getIssue,
        updateIssue,
        addComment,
        editComment,
        addAttachment,
        doAction
    }
})