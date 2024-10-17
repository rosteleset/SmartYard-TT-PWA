<script setup lang="ts">
import useViewers from "@/hooks/useViewers";
import { useTtStore } from "@/stores/ttStore";
import { useUsersStore } from "@/stores/usersStore";
import { IonItem, IonLabel, IonText } from "@ionic/vue";
import dayjs from "dayjs";
import { computed, onMounted, ref, shallowRef, watch } from "vue";


const { issue, field: _field, target, cf, _value } = defineProps<{
    issue: Issue | DetailIssue,
    field: string,
    target: string,
    cf?: CustomField,
    _value?: any
}>()

const tt = useTtStore()
const users = useUsersStore()
const text = ref<string | undefined>()
const component = shallowRef<any>()
const field = computed(() => _field[0] === '*' ? _field.slice(1) : _field)
const viewers = useViewers()


const setText = () => {
    const value = _value || issue[field.value]
    const viewer = tt.meta?.viewers.find(v => v.field === field.value)

    if (viewer) {
        try {
            const _viewer = viewers.getViewer(viewer.code)
            const result = _viewer(value, issue, field.value, target)
            if (result && typeof result === 'object' && result.template) {
                component.value = result
            }
            else
                text.value = result
        } catch (e) {
            text.value = value
            console.warn(viewer.filename, e)
        }
    } else if (cf) {

        if (value)
            switch (cf.editor) {
                // case "text":

                //     break;
                case "date":
                    text.value = dayjs.unix(value).format('DD.MM.YYYY')
                    break;
                case "datetime-local":
                    text.value = dayjs.unix(value).format('DD.MM.YYYY HH:mm')
                    break;
                case "noyes":
                    text.value = Number(value) ? 'yes' : 'no'
                    break;
                default:
                    text.value = value
                    break;
            }

    } else
        switch (field.value) {
            case "workflow":
                text.value = tt.meta?.workflows[value].name
                break;
            case "created":
            case "updated":
                text.value = dayjs.unix(value).format('DD.MM.YYYY HH:mm')
                break;
            case "assigned":
            case "watchers":
                if (typeof value === 'string')
                    text.value = value
                else if (Array.isArray(value))
                    text.value = value.map(v => users.users.find(u => u.login === v)?.realName || v).join(', ')
                else if (value)
                    text.value = Object.values(value).map(v => users.users.find(u => u.login === v)?.realName || v).join(', ')
                break;
            default:
                text.value = Array.isArray(value) ? value.join(', ') : value
                break;
        }
}

onMounted(setText)
watch(() => issue, setText)

</script>

<template>
    <IonItem v-if="text || component">
        <IonLabel v-if="target === 'pwa'">
            <h2>
                <IonText color="secondary">
                    <b>{{ cf?.fieldDisplay || $t(field) }}</b>
                </IonText>
            </h2>
            <component v-if="component" :is="component" />
            <div v-else v-html="text"></div>
        </IonLabel>
        <IonLabel v-else>
            <IonText color="secondary">
                <b>{{ cf?.fieldDisplay || $t(field) }}: </b>
            </IonText>
            <component v-if="component" :is="component" />
            <span v-else v-html="text"></span>
        </IonLabel>
    </IonItem>
</template>

<style scoped></style>