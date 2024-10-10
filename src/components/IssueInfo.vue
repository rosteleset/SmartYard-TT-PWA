<script setup lang="ts">
import { IonItemGroup, IonItemDivider, IonLabel, IonItem } from "@ionic/vue";
import { useTtStore } from "@/stores/ttStore";
import { computed, onMounted, provide } from "vue";
import IssueField from "./IssueField.vue";
import { useI18n } from "vue-i18n";

const tt = useTtStore()
const { t } = useI18n()

const { issue } = defineProps<{
    issue: IssueData
}>()

const groupedCustomFields = computed(() => {
    return tt.meta?.customFields.reduce((groups: Record<string, CustomField[]>, field) => {
        const catalog = field.catalog || t('uncategorized');
        if (!groups[catalog]) {
            groups[catalog] = [];
        }
        if (Object.values(issue.fields).includes(`_cf_${field.field}`))
            groups[catalog].push(field);
        return groups;
    }, {});
});

</script>

<template>
    <IonItemGroup>
        <IonItemDivider>
            <IonLabel>0</IonLabel>
        </IonItemDivider>
        <IssueField v-for="field in Object.values(issue.fields).filter(f => f[0] === '*')" :issue="issue.issue"
            :field="field" :key="field"
            :cf="field.match('_cf_') ? tt.meta?.customFields.find(cf => cf.field === field.slice(5)) : undefined" />
    </IonItemGroup>

    <IonItemGroup>
        <IonItemDivider>
            <IonLabel>base</IonLabel>
        </IonItemDivider>
        <IssueField
            v-for="field of Object.values(issue.fields).filter(field => field[0] !== '*' && !field.match('_cf_'))"
            :issue="issue.issue" :field="field" :key="field" />
    </IonItemGroup>

    <IonItemGroup v-for="(fields, catalog) in groupedCustomFields" :key="catalog" class="item-group-has">
        <IonItemDivider>
            <IonLabel>{{ catalog }}</IonLabel>
        </IonItemDivider>
        <IssueField v-for="field of fields" :key="field.field" :issue="issue.issue" :field="`_cf_${field.field}`"
            :cf="field" />
    </IonItemGroup>
</template>

<style scoped>
/* скрытие пустых групп */
.item-group-has:not(:has(ion-item)) {
    display: none !important;
}
</style>