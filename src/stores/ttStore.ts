import api from "@/utils/api";
import { Preferences } from "@capacitor/preferences";
import { useIonRouter } from "@ionic/vue";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { LocationQuery, useRoute, useRouter } from "vue-router";

export const useTtStore = defineStore('tt', () => {

    const route = useRoute();
    const { push } = useIonRouter()

    // state
    const meta = ref<Meta>()
    const project = ref<Project>()
    const filter = ref<FilterWithLabel>()
    const projection = ref<Record<string, number>>({})
    const sortBy = ref<{ target: string, direction: number }>()
    const issue = ref<IssueData>()

    // actions
    const load = async (query: LocationQuery) => {

        return api.GET('tt/tt')
            .then(async (res) => {
                console.log(query.project && typeof query.project === 'string');

                meta.value = res.meta
                if (query.project && typeof query.project === 'string')
                    project.value = getProjectByAcronym(query.project)
                else {
                    const { value } = await Preferences.get({ key: 'lastProject' })

                    if (value)
                        project.value = getProjectByAcronym(value)
                    else 
                        project.value = meta.value?.projects[0]
                }

                if (query.filter && typeof query.filter === 'string')
                    filter.value = getFilterWithLabel(query.filter)
                else {
                    const { value } = await Preferences.get({ key: 'lastFilter' })

                    if (value)
                        filter.value = getFilterWithLabel(value)
                    else
                        filter.value = getFilterWithLabel('common_all')

                }
                Preferences.get({ key: 'lastSort' }).
                    then(({ value }) => {
                        if (value)
                            sortBy.value = JSON.parse(value)
                    })
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
        const label = meta.value?.filters[filter.toString()]

        if (!_filter)
            throw new Error('Filter not found')
        return { ...{ label: label || _filter.filter }, ..._filter }
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
            if (sortBy.value) {
                params[`sort[${sortBy.value.target}]`] = sortBy.value.direction.toString()
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
            if (save) {
                issue.value = res.issue
                project.value = getProjectByAcronym(res.issue.issue.project)
            }
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

    const deleteIssue = (_issue?: string) => {
        return api.DELETE(`tt/issue/${_issue || issue.value?.issue.issueId}`)
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

    const addAttachments = (attachments: any[]) => {
        return api.POST('tt/file', { issueId: issue.value?.issue.issueId, attachments: attachments })
    }

    const doAction = async ({ action, set, issueId }: { action: string, set?: any, issueId?: string }) => {

        return api.PUT(`tt/action/${issueId || issue.value?.issue.issueId}`, {
            action,
            set
        });
        // presentAlert({
        //     header: t('failed-to-perform-action'),
        //     message: error.message,
        //     buttons: [t('ok')],
        // })
    }

    watch([project, filter, sortBy], ([nextProject, nextFilter, nextSortBy], [, , prevSortBy]) => {
        const newQuery = { ...route.query };

        if (nextProject && nextProject?.acronym !== route.query.project) {
            newQuery.project = nextProject?.acronym;
            Preferences.set({ key: 'lastProject', value: nextProject.acronym });
        }

        if (nextFilter && nextFilter?.filter !== route.query.filter) {
            newQuery.filter = nextFilter?.filter;
            Preferences.set({ key: 'lastFilter', value: nextFilter.filter });
        }

        const json = JSON.stringify(nextSortBy);
        if (json !== JSON.stringify(prevSortBy)) {
            Preferences.set({ key: 'lastSort', value: json });
        }

        if (route.name === 'issues')
            push({ query: newQuery });
    });


    return {
        meta,
        project,
        filter,
        projection,
        sortBy,
        issue,
        load,
        getProjectByAcronym,
        getFilterWithLabel,
        getIssues,
        getIssue,
        updateIssue,
        deleteIssue,
        addComment,
        editComment,
        addAttachment,
        addAttachments,
        doAction
    }
})