<script setup lang="ts">
import IssueAttachments from '@/components/IssueAttachments.vue';
import IssueComments from '@/components/IssueComments.vue';
import IssueInfo from '@/components/IssueInfo.vue';
import PageHeader from '@/components/PageHeader.vue';
import { useActions } from '@/hooks/useActions';
import { useTtStore } from '@/stores/ttStore';
import { ActionSheetButton, IonActionSheet, IonContent, IonLabel, IonPage, IonSegment, IonSegmentButton, IonToolbar } from '@ionic/vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const tt = useTtStore()
const route = useRoute()
const actions = useActions()

const issue = computed(() => tt.issue)
const segment = ref('info')
const isActionsOpen = ref(false)

const id = computed(() => route.params['id'] as string)
const buttons = computed<ActionSheetButton[]>(() =>
    issue.value ? actions.getButtons(issue.value) : []
);

const loadIssue = () => {
    if (id.value)
        tt.getIssue(id.value, true)
}

onMounted(loadIssue)

watch(route, loadIssue)

</script>

<template>
    <IonPage>
        <PageHeader :label="issue?.issue.issueId || id" defaultHref="/tt" @actions="isActionsOpen = true">
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
            <IssueAttachments v-if="issue && segment === 'attachments'" :issue="issue" />
            <IssueComments v-if="issue && segment === 'comments'" :issue="issue" />
        </IonContent>
        <IonActionSheet class="custom-actions" :is-open="isActionsOpen" :header="$t('actions')" :buttons="buttons"
            @didDismiss="() => isActionsOpen = false" />
    </IonPage>
</template>

<style scoped>
.custom-actions:deep(.action-sheet-button.action-sheet-separator) {
    min-height: 1px;
    padding: 0;
    background-color: var(--ion-color-light-contrast);
}
</style>