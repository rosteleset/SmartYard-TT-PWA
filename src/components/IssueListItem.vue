<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonList } from '@ionic/vue';
import dayjs from "dayjs";
import { computed } from 'vue';
import IssueField from './IssueField.vue';

const { issue, projection } = defineProps<{ issue: Issue, projection: Record<string, number> }>()

const tt = useTtStore()

const fields = computed(() => Object.keys(projection).map(key => {
    if (['issueId', 'created'].includes(key))
        return null
    return {
        field: key,
        cf: key.startsWith('_cf_') ? tt.meta?.customFields.find(cf => '_cf_' + cf.field === key) : undefined,
        value: issue[key]
    }
}).filter(i => i !== null))

</script>

<template>
    <IonCard button>
        <IonCardHeader class="header">
            <IonCardTitle>{{ issue.issueId }}</IonCardTitle>
            <IonCardSubtitle v-if="projection.created">{{ dayjs.unix(issue.created).format('DD.MM.YYYY HH:mm') }}
            </IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent class="content">
            <IssueField v-for="field in fields" :key="field.field" :issue="issue" :field="field?.field" :cf="field.cf"
                target="pwa-list" />
        </IonCardContent>
    </IonCard>
</template>

<style scoped>
.header {
    padding-top: 8px;
    padding-bottom: 8px;
}
.content {
    padding: 0;
}
</style>