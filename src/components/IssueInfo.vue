<script setup lang="ts">
import { IonItemGroup, IonItemDivider, IonLabel, IonItem } from "@ionic/vue";
import { useTtStore } from "@/stores/ttStore";
import { computed, onMounted, provide } from "vue";

const tt = useTtStore()

const { issue } = defineProps<{
    issue: IssueData
}>()

const groupedCustomFields = computed(() => {
    return tt.meta?.customFields.reduce((groups: Record<string, CustomField[]>, field) => {
        const catalog = field.catalog || 'Без категории';
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
        <IonItem v-for="field in Object.values(issue.fields).filter(f => f[0] === '*')" :key="field">
            <IonLabel>{{ field }} : {{ issue.issue[field.slice(1)] }}</IonLabel>
        </IonItem>
    </IonItemGroup>

    <IonItemGroup>
        <IonItemDivider>
            <IonLabel>base</IonLabel>
        </IonItemDivider>
        <IonItem v-for="field of Object.values(issue.fields).filter(field => field[0] !== '*' && !field.match('_cf_'))" :key="field">
            <IonLabel>{{ field }} : {{ issue.issue[field] }}</IonLabel>
        </IonItem>
    </IonItemGroup>

    <IonItemGroup v-for="(fields, catalog) in groupedCustomFields" :key="catalog" class="item-group-has">
        <IonItemDivider>
            <IonLabel>{{ catalog }}</IonLabel>
        </IonItemDivider>
        <IonItem v-for="field of fields" :key="field.field">
            <IonLabel>{{ field.field }} : {{ issue.issue[field.field] }}</IonLabel>
        </IonItem>
    </IonItemGroup>
</template>

<style scoped>
/* скрытие пустых групп */
.item-group-has:not(:has(ion-item)) {
    display: none !important;
}
</style>