<script setup lang="ts">
import api from '@/utils/api';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonItem, IonItemDivider, IonLabel, IonText } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import IssueField from './IssueField.vue';
import { useTtStore } from '@/stores/ttStore';
import dayjs from "dayjs";
import { useI18n } from 'vue-i18n';

interface Journal {
    date: number;
    issue: string;
    login: string;
    action: string;
    old: Record<string, any> | null;
    new: Record<string, any>;
}

const { issue } = defineProps<{
    issue: IssueData
}>()

const tt = useTtStore()
const { t } = useI18n()

const data = ref<Journal[]>()

const getCustomField = (field: string) => {
    if (field.match('_cf_'))
        return tt.meta?.customFields.find(cf => cf.field === field.slice(4))
}

const getActionLabel = (value: string) => {
    const arr = value.split("#")
    const action = arr[0];
    if (arr.length > 1) {
        const indx = parseInt(arr[1]) + 1;
        return `${t('journal.' + action)} [#${indx}]`
    }

    return `${t('journal.' + action)}`
}

onMounted(() => {
    api.GET(`tt/journal/${issue.issue.issueId}`)
        .then(res => {
            data.value = res.journal
        })
})
</script>

<template>

    <IonCard v-for="item in data">
        <IonCardHeader>
            <IonCardTitle>
                <IonText color="primary">{{ item.login }}</IonText>{{ ': ' }}{{ getActionLabel(item.action) }}
            </IonCardTitle>
            <IonCardSubtitle>{{ dayjs.unix(item.date).format('DD.MM.YYYY HH:mm') }}</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
            <template v-if="item.old">
                <IonItemDivider>
                    <IonLabel>{{ $t('journal.old') }}</IonLabel>
                </IonItemDivider>
                <IssueField v-for="(value, key) in item.old" :issue="issue.issue" :field="key" :cf="getCustomField(key)"
                    target="pwa-journal" :_value="value" />
            </template>
            <template v-if="item.new">
                <IonItemDivider>
                    <IonLabel>{{ $t('journal.new') }}</IonLabel>
                </IonItemDivider>
                <IssueField v-for="(value, key) in item.new" :issue="issue.issue" :field="key" :cf="getCustomField(key)"
                    target="pwaJournal" :_value="value" />
            </template>
        </IonCardContent>
    </IonCard>

</template>