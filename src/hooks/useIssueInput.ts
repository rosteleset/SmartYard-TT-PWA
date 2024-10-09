import { useTtStore } from "@/stores/ttStore";
import CustomSelect from "@/components/CustomSelect.vue";
import { onMounted, ref } from "vue";
import api from "@/utils/api";
import { IonInput, IonTextarea } from "@ionic/vue";
import { useI18n } from "vue-i18n";
import CustomFileInput from "@/components/CustomFileInput.vue";
import CustomAutocomplete from "@/components/CustomAutocomplete.vue";

const useIssueInput = () => {
    const tt = useTtStore()
    const { t } = useI18n()

    const users = ref()
    const groups = ref()

    // проверка на множественный выбор (если "assigned" в проекте === 3, 4, 5)
    const isMultiple = (project: Project) => [3, 4, 5].includes(project.assigned)

    const getPeoples = (project: Project) => {
        const withGroups = [0, 2, 3, 5].includes(project.assigned)
        const withUsers = [0, 1, 3, 4].includes(project.assigned)
        const result = []

        if (withGroups) {
            result.push(...project.groups.map(group => group.acronym))
        }
        if (withUsers) {
            result.push(...project.users.map(user => user.login))
        }

        return result
    }

    const getCustomFieldComponent = (fieldId: string, project: Project) => {
        const cf = tt.meta?.customFields.find(cf => cf.field === fieldId)
        if (!cf)
            return
        let component;
        const props: Record<string, any> = {
            id: "_cf_" + fieldId,
            field: cf.field,
            labelPlacement: 'floating',
            label: cf.fieldDisplay || fieldId
        };
        const slots: Record<string, any> = {};

        switch (cf.type) {
            case "text":
                if (cf.editor)
                    component = IonInput;
                props.readonly = cf.editor === "text-ro";
                props.type = cf.editor;
                break;
            case "select":
                if (cf.format && cf.format.indexOf("suggestions") >= 0) {
                    component = CustomAutocomplete
                    props.getSuggestion = (query: string) => api.GET('/tt/suggestions', {
                        project: project.acronym,
                        field: `_cf_${cf.field}`,
                        query: query
                    })
                        .then(res => res.suggestions)
                }
                else
                    component = CustomSelect;
                if (cf.options && cf.options.length > 0) {
                    props.variants = cf.options.map(option => option.option);
                    props.text = cf.options.reduce((acc, item) => ({
                        ...acc,
                        [item.option]: item.optionDisplay
                    }), {} as Record<string, string>);
                    props.multiple = cf.format?.includes("multiple");
                }
                break;
            case "array":
                component = CustomSelect;
                props.variants = []; // Здесь можно добавить обработку для массивов, если необходимо
                props.multiple = true;
                props.tags = true;
                props.createTags = true;
                break;
            case "geo":
                component = CustomAutocomplete;
                props.getSuggestion = (query: string) => api.GET('/geo/suggestions', {
                    search: query
                }).then(res => res.suggestions.map((s: any) => s.value))
                break;
            case "users":
                component = CustomSelect;
                props.variants = getPeoples(project);
                props.multiple = cf.format?.includes("multiple");
                break;
            case "issues":
                component = CustomAutocomplete;
                props.getSuggestion = (query: string) => api.GET('/tt/issues', {
                    project: project.acronym,
                    filter: "#issueSearch",
                    skip: '0',
                    limit: '32768',
                    search: query
                }).then(res => res.issues.issues.map((issue: any) => issue.issueId))
                break
            default:
                component = IonInput;
                break;
        }

        return { component, props, slots };
    };

    const getComponent = (field: string, _project?: Project) => {
        const project = _project || tt.project

        if (!project)
            throw new Error('Project not found.')

        let component
        const props: Record<string, any> = {
            field,
            project,
            labelPlacement: 'floating',
            label: t('field')
        }
        const slots: Record<string, any> = {}

        if (field.substring(0, 4) !== "_cf_")
            switch (field) {
                case "subject":
                    component = IonInput

                    break;
                case "description":
                case "comment":
                case "optionalComment":
                    component = IonTextarea
                    break;
                case "resolution":
                    component = CustomSelect
                    props.variants = tt.meta?.resolutions.map(resolution => resolution.resolution)
                    break;
                case "assigned":
                case "watchers":
                    component = CustomSelect
                    props['variants'] = getPeoples(project)
                    props['multiple'] = isMultiple(project)
                    break;
                case "status":
                    component = CustomSelect
                    props['variants'] = tt.meta?.statuses.map(tag => tag.status)
                    break
                case "tags":
                    component = CustomSelect
                    props['variants'] = project.tags.map(tag => tag.tag)
                    props['multiple'] = true
                    break
                case "links":
                case "workflow":
                    component = CustomSelect
                    break
                case "commentPrivate":
                    component = IonInput
                    break
                case "attachments":
                    component = CustomFileInput
                    break;
                default:
                    component = IonInput
                    break
            }
        else {
            const fieldId = field.substring(4)
            const cf = getCustomFieldComponent(fieldId, project);
            if (cf)
                return cf
        }
        return {
            component,
            props,
            slots
        }
    }

    onMounted(() => {
        api.GET('accounts/users')
            .then(res => users.value = res.users)
        api.GET('accounts/groups')
            .then(res => groups.value = res.groups)
    })

    return { getComponent }
}

export default useIssueInput