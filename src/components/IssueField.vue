<script setup lang="ts">
import { IonItem, IonLabel, IonProgressBar, IonText } from "@ionic/vue";
import dayjs from "dayjs";
import { computed, inject, onMounted, ref, shallowRef, watch } from "vue";
import { useTtStore } from "@/stores/ttStore";
import useViewers, { UseViewers } from "@/hooks/useViewers";


const { issue, field: _field, cf, _value } = defineProps<{
    issue: DetailIssue,
    field: string,
    cf?: CustomField,
    _value?: any
}>()

const tt = useTtStore()
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
            const result = _viewer(value, issue, field.value)
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
        <IonLabel>
            <h2>{{ cf?.fieldDisplay || field }}</h2>
            <component v-if="component" :is="component" />
            <div v-else v-html="text"></div>
        </IonLabel>
    </IonItem>
</template>

<style scoped></style>