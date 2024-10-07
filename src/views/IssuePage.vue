<script setup lang="ts">
import IssueInfo from '@/components/IssueInfo.vue';
import PageHeader from '@/components/PageHeader.vue';
import { useTtStore } from '@/stores/ttStore';
import api from '@/utils/api';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonSegment, IonSegmentButton, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const tt = useTtStore()
const { currentRoute, push } = useRouter()

const id = computed(() => currentRoute.value.params['id'] as string)
const issue = ref<IssueData>()
const segment = ref('info')

const loadIssue = () => {
    const id = currentRoute.value.params['id'] as string
    tt.getIssue(id)
        .then(res => issue.value = res)
}

onMounted(loadIssue)

watch(currentRoute, loadIssue)

</script>

<template>
    <IonPage>
        <PageHeader :label="issue?.issue.issueId || id" defaultHref="/tt">
            <IonToolbar>
                <IonSegment v-model="segment">
                    <IonSegmentButton value="info">
                        <IonLabel>{{ 'info' }}</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="attachments">
                        <IonLabel>{{ 'attachments' }}</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="comments">
                        <IonLabel>{{ 'comments' }}</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
            </IonToolbar>
        </PageHeader>
        <IonContent>
            <IssueInfo v-if="issue && segment === 'info'" :issue="issue" />
            <!-- <IssueAttachments v-if="data && segment === 'attachments'" :issue="data" /> -->
            <!-- <IssueComments v-if="data && segment === 'comments'" :issue="data" /> -->
        </IonContent>
    </IonPage>
</template>

<style scoped></style>