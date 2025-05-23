<script setup lang="ts">
import { useTtStore } from "@/stores/ttStore";
import { IonItemDivider, IonItemGroup, IonLabel } from "@ionic/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import IssueField from "./IssueField.vue";

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

const getCustomField = (field: string) => {
    if (field.match('_cf_'))
        return tt.meta?.customFields.find(cf => cf.field === field.slice(5))
}

</script>

<template>
    <IonItemGroup>
        <IonItemDivider>
            <IonLabel>{{ $t('info') }}</IonLabel>
        </IonItemDivider>
        <IssueField v-for="field in Object.values(issue.fields).filter(f => f[0] === '*')" :issue="issue.issue"
            :field="field" :key="field" :cf="getCustomField(field)" target="pwa" />
    </IonItemGroup>

    <IonItemGroup>
        <IonItemDivider>
            <IonLabel>{{ $t('base') }}</IonLabel>
        </IonItemDivider>
        <IssueField
            v-for="field of Object.values(issue.fields).filter(field => field[0] !== '*' && !field.match('_cf_'))"
            :issue="issue.issue" :field="field" :key="field" target="pwa" />
    </IonItemGroup>

    <IonItemGroup v-for="(fields, catalog) in groupedCustomFields" :key="catalog" class="item-group-has">
        <IonItemDivider>
            <IonLabel>{{ catalog }}</IonLabel>
        </IonItemDivider>
        <IssueField v-for="field of fields" :key="field.field" :issue="issue.issue" :field="`_cf_${field.field}`"
            :cf="field" target="pwa" />
    </IonItemGroup>
</template>

<style scoped>
/* скрытие пустых групп */
.item-group-has:not(:has(ion-item)) {
    display: none !important;
}
</style>