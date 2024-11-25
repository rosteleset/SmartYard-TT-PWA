<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue';
import { useActions } from '@/hooks/useActions';
import useAlert from '@/hooks/useAlert';
import useCdr from '@/hooks/useCdr';
import { useTtStore } from '@/stores/ttStore';
import { ActionSheetButton, IonActionSheet, IonContent, IonLabel, IonPage, IonProgressBar, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, IonSegmentContent, IonSegmentView, IonToolbar, RefresherCustomEvent } from '@ionic/vue';
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
const IssueAttachments = defineAsyncComponent(() => import('@/components/IssueAttachments.vue'));
const IssueCdr = defineAsyncComponent(() => import('@/components/IssueCdr.vue'));
const IssueComments = defineAsyncComponent(() => import('@/components/IssueComments.vue'));
const IssueInfo = defineAsyncComponent(() => import('@/components/IssueInfo.vue'));
const IssueJournal = defineAsyncComponent(() => import('@/components/IssueJournal.vue'));


const tt = useTtStore()
const route = useRoute()
const actions = useActions()
const alert = useAlert()
const { t } = useI18n()
const { hasCdr } = useCdr()

const issue = computed(() => tt.issue)
const segment = ref('info')
const isActionsOpen = ref(false)
const loading = ref(false)

const id = computed(() => route.params['id'] as string)
const buttons = computed<ActionSheetButton[]>(() =>
    issue.value ? actions.getButtons(issue.value) : []
);

const loadIssue = async () => {
    if (!id.value)
        return
    loading.value = true
    await tt.getIssue(id.value, true)
        .catch(e => alert.presentAlert({
            header: t('something-went-wrong'),
            message: t(`errors.${e.message}`)
        }))
        .finally(() => {
            loading.value = false
        })
}

const handleRefresh = (event?: RefresherCustomEvent) => {
    loadIssue()
        .then(() => event?.target.complete())
}

const tabs = computed(() => {
    const arr = [
        {
            name: 'info',
            component: IssueInfo
        }
    ]
    if (issue.value?.issue.attachments && Object.keys(issue.value.issue.attachments).length > 0)
        arr.push({
            name: 'attachments',
            component: IssueAttachments
        })

    if (issue.value?.issue.comments && Object.keys(issue.value.issue.comments).length > 0)
        arr.push({
            name: 'comments',
            component: IssueComments
        })

    if (issue.value && hasCdr(issue.value?.issue))
        arr.push({
            name: 'cdr',
            component: IssueCdr
        })

    if (issue.value?.issue.attachments && Object.keys(issue.value.issue.attachments).length > 0)
        arr.push({
            name: 'journal',
            component: IssueJournal
        })
    return arr
})

onMounted(loadIssue)
onUnmounted(() => tt.issue = undefined)
watch(() => route.params['id'], loadIssue)

</script>

<template>
    <IonPage>
        <PageHeader :label="issue?.issue.issueId || id" defaultHref="/" @actions="isActionsOpen = true">
            <IonToolbar>
                <IonSegment v-if="issue" :scrollable="true" @touchstart.stop @touchmove.stop @touchend.stop>
                    <IonSegmentButton v-for="tab in tabs" :contentId="tab.name">
                        <IonLabel>{{ $t(tab.name) }}</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
                <IonProgressBar v-if="loading" type="indeterminate"></IonProgressBar>
            </IonToolbar>
        </PageHeader>
        <IonContent scrollEvents>
            <IonRefresher slot="fixed" @ionRefresh="handleRefresh($event)">
                <IonRefresherContent />
            </IonRefresher>

            <IonSegmentView>
                <IonSegmentContent v-for="tab in tabs" :id="tab.name">
                    <component v-if="issue" :is="tab.component" :issue="issue" />
                </IonSegmentContent>
            </IonSegmentView>
        </IonContent>
        <IonActionSheet class="custom-actions" :is-open="isActionsOpen" :header="$t('actions')" :buttons="buttons"
            @didDismiss="isActionsOpen = false" />
    </IonPage>
</template>

<style scoped>
.custom-actions:deep(.action-sheet-button.action-sheet-separator) {
    min-height: 1px;
    padding: 0;
    background-color: var(--ion-color-light-contrast);
}
</style>