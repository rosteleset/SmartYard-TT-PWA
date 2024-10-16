<template>
    <IonItem v-if="fieldData">
        <component :is="fieldData.component" v-model="model" v-bind="fieldData.attributes">
            <template v-if="fieldData.attributes.options">
                <ion-select-option v-for="option in fieldData.attributes.options" :key="option.id" :value="option.id">{{
                    option.text }}</ion-select-option>
            </template>
        </component>
    </IonItem>
</template>

<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import api from '@/utils/api';
import { IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime, IonCheckbox, IonItem } from '@ionic/vue';
import { computed } from 'vue';
import CustomAutocomplete from './CustomAutocomplete.vue';
import { useI18n } from 'vue-i18n';
import CustomToggle from './CustomToggle.vue';
import { useUsersStore } from '@/stores/usersStore';

const props = defineProps<{
    field: string,
    project?: Project,
    filter?: any
}>()

const model = defineModel<any>()

const users = useUsersStore()
const tt = useTtStore()
const { t } = useI18n()

const field = computed(() => props.field.substring(0, 4) === "_cf_" ? props.field.substring(4) : props.field)
const project = computed<Project>(() => props.project || tt.project as Project)
const customField = computed(() => tt.meta?.customFields.find(f => f.field === field.value))
const fieldData = computed(() => getFieldData())

const getFieldData = () => {
    let component;
    let attributes: any = {
        id: field.value,
        placeholder: customField.value?.fieldDescription || customField.value?.fieldDisplay || t(field.value),
        label: customField.value?.fieldDisplay || t(field.value),
        labelPlacement: 'floating'
    };

    if (customField.value) {
        const cf = customField.value;
        if (cf.type === 'virtual')
            return
        let validate: any = false;
        if (cf.required && !cf.regex) {
            validate = (v: string) => v && v.trim() !== "";
        } else if (!cf.required && cf.regex) {
            validate = (v: string) => new RegExp(cf.regex || '').test(v);
        } else if (cf.required && cf.regex) {
            validate = (v: string) => v && v.trim() !== "" && new RegExp(cf.regex || '').test(v);
        }

        switch (cf.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'tel':

                switch (cf.editor) {
                    case 'yesno':
                    case 'noyes':
                        component = CustomToggle;
                        model.value = cf.editor === 'yesno' ? true : false;
                        break;
                    case 'area':
                        component = IonTextarea;
                        attributes.autoGrow = true;
                        break;
                    default:
                        component = IonInput;
                        attributes.type = cf.editor;
                        attributes.readonly = cf.editor === "text-ro";
                        // attributes.value = model.value || "";
                        attributes.validate = validate;
                        break;
                }

                break;
            case 'area':
                component = IonTextarea;
                attributes.autoGrow = true;
                attributes.validate = validate;
                break;
            case 'select':
                component = IonSelect;
                attributes.interface = "popover"
                let options = [];
                if (cf.format && cf.format.indexOf("suggestions") >= 0) {
                    component = CustomAutocomplete;
                    attributes.getSuggestion = getSuggestions
                }
                options.push(...cf.options.map((opt: any) => ({
                    id: opt.option,
                    text: opt.optionDisplay,
                })));
                attributes.options = select2Filter(options, props.filter);
                attributes.multiple = cf.format.indexOf("multiple") >= 0;
                attributes.tags = cf.format && cf.format.indexOf("editable") >= 0;
                attributes.createTags = cf.format && cf.format.indexOf("editable") >= 0;
                attributes.validate = validate;
                break;
            case 'datetime-local':
                component = IonDatetime;
                attributes.value = model.value || "";
                attributes.validate = validate;
                break;
            case 'checkbox':
                component = CustomToggle;
                attributes.value = model.value || false;
                attributes.validate = validate;
                break;
            case 'users':
                component = CustomAutocomplete;
                attributes.interface = "popover"

                if (cf.format.split(" ").includes("users")) {
                    attributes.options = getPeoples(project.value, false, true);
                } else if (cf.format.split(" ").includes("groups")) {
                    attributes.options = getPeoples(project.value, true, false);
                } else if (cf.format.split(" ").includes("usersAndGroups")) {
                    attributes.options = getPeoples(project.value, true, true);
                }

                attributes.multiple = cf.format.indexOf("multiple") >= 0;
                attributes.validate = validate;
                break;
            case 'array':
                component = IonSelect;
                attributes.interface = "popover"
                attributes.options = select2Filter(model.value || [], props.filter);
                attributes.multiple = true;
                attributes.tags = true;
                attributes.createTags = true;
                attributes.validate = validate;
                break;
            case 'geo':
                component = IonSelect;
                attributes.interface = "popover"
                attributes.options = select2Filter(model.value || [], props.filter);
                attributes.validate = validate;
                attributes.getSuggestion = getGeoSuggestions;
                break;
            case 'issues':
                component = CustomAutocomplete;
                attributes.options = select2Filter(model.value || [], props.filter);
                attributes.multiple = cf.format.indexOf("multiple") >= 0;
                attributes.validate = validate;
                attributes.ajax = getLinksSuggestions;
                break;
            default:
                component = IonInput;
        }
    } else {
        switch (field.value) {
            case 'issueId':
                component = IonInput;
                attributes.hidden = true;
                break;
            case 'subject':
            case 'description':
            case 'comment':
            case 'optionalComment':
                component = IonTextarea;
                attributes.validate = (v: string) => v.trim() !== '';
                break;
            case 'commentPrivate':
                component = CustomToggle;
                break
            case 'resolution':
                component = IonSelect;
                attributes.options = select2Filter(tt.meta?.resolutions || [], props.filter);
                attributes.validate = (v: string) => v.trim() !== '';
                break;
            case 'status':
                component = IonSelect;
                attributes.options = tt.meta?.statuses;
                break;
            case 'tags':
                component = IonSelect;
                attributes.tags = true;
                attributes.multiple = true;
                attributes.options = select2Filter(tt.meta?.tags || [], props.filter);
                break;
            case 'assigned':
            case 'watchers':
                component = IonSelect;
                attributes.interface = "popover"
                attributes.multiple = [3, 4, 5].includes(project.value.assigned);
                attributes.options = getPeoples(project.value, [0, 2, 3, 5].includes(project.value.assigned), [0, 1, 3, 4].includes(project.value.assigned));
                break;
            case 'links':
                component = CustomAutocomplete;
                attributes.multiple = true;
                attributes.getSuggestion = getLinksSuggestions;
                break;
            case 'attachments':
                component = IonItem;
                attributes.maxSize = project.value.maxFileSize;
                break;
            case 'workflow':
                component = IonSelect;
                attributes.interface = "popover"
                attributes.options = workflowsByProject(project.value);
                break;
            default:
                component = IonInput;
        }
    }

    return { component, attributes };
};

const select2Filter = (options: any[], filter: any) => {
    if (!filter) return options;
    return options.filter(option => filter.includes(option.id) || filter.includes(option.text));
};

const getPeoples = (project: Project, withGroups: boolean, withUsers: boolean) => {
    // const withGroups = [0, 2, 3, 5].includes(project.assigned)
    // const withUsers = [0, 1, 3, 4].includes(project.assigned)
    const result = []

    if (withGroups) {
        result.push(...project.groups.map(group => ({
            id: group.acronym,
            text: `${users.groups.find(f => f.gid === group.gid)?.name} [${group.acronym}]`,
        })))
    }
    if (withUsers) {
        result.push(...project.users.map(user => ({
            id: user.login,
            text: `${users.users.find(u => u.uid === user.uid)?.realName} [${user.login}]`,
        })))
    }

    return result
}

const getLinksSuggestions = (query: string) =>
    api.GET('/tt/issues', {
        project: project.value.acronym,
        filter: "#issueSearch",
        skip: '0',
        limit: '32768',
        search: query
    }).then(res => res.issues.issues.map((issue: any) => ({ id: issue.issueId, text: issue.issueId })))

const getGeoSuggestions = (query: string) =>
    api.GET('/geo/suggestions', {
        search: query
    }).then(res => res.suggestions.map((s: any) => ({ id: s.value, text: s.value })))

const getSuggestions = (query: string) =>
    api.GET('/tt/suggestions', {
        project: project.value.acronym,
        field: props.field,
        query: query
    })
        .then(res => res.suggestions.map((i: any) => ({ id: i, text: i })))

const workflowsByProject = (project: Project) => {
    let workflows = [];
    if (project.workflows) {
        for (let workflow of project.workflows) {
            workflows.push({
                id: workflow,
                text: tt.meta?.workflows[workflow].name,
            });
        }
    }
    console.log(project);

    console.log(workflows);

    return workflows;
};
</script>

<style scoped></style>