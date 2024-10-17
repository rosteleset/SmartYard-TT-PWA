<script setup lang="ts">
import IssueCreate from '@/components/IssueCreate.vue';
import IssueListItem from '@/components/IssueListItem.vue';
import IssuesFilters from '@/components/IssuesFilters.vue';
import useAlert from '@/hooks/useAlert';
import useModal from '@/hooks/useModal';
import { useTtStore } from '@/stores/ttStore';
import { InfiniteScrollCustomEvent, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonProgressBar, IonRefresher, IonRefresherContent, IonSearchbar, IonTitle, IonToolbar, menuController, RefresherCustomEvent } from '@ionic/vue';
import { add } from 'ionicons/icons';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const tt = useTtStore()
const { t } = useI18n()
const { currentRoute, push } = useRouter()
const { presentAlert } = useAlert()
const { openModal } = useModal()

const issues = ref<Issue[]>([])
const projection = ref<Record<string, number>>({})
const count = ref<number>(0)
const limit = ref<number>(40)
const skip = ref<number>(0)
const search = ref(currentRoute.value.query.search as string || '')
const loading = ref(false)

const load = async (event?: InfiniteScrollCustomEvent) => {
    // if (!tt.project && (!tt.filter || !search.value))
    try {
        loading.value = true
        const res = await tt.getIssues({
            limit: limit.value,
            skip: skip.value,
            search: search.value
        });
        issues.value = Number(res.skip) === 0 ? res.issues : [...issues.value, ...res.issues]
        projection.value = res.projection
        count.value = res.count
        limit.value = Number(res.limit)
        skip.value = Number(res.skip) + limit.value
        event?.target.complete()
    } catch (e) {
        console.warn(e);
    } finally {
        loading.value = false
    }
}

const handleOpen = async (issue: Issue) => {
    await push({ name: 'issue', params: { id: issue.issueId } })
}

const handleRefresh = (event?: RefresherCustomEvent) => {
    menuController.close('issuesMenu')
    skip.value = 0
    load()
        .then(() => event?.target.complete())
}

const handleSearch = () => {
    push({ query: { ...currentRoute.value.query, search: search.value } })
    if (tt.project)
        handleRefresh()
    else
        presentAlert({
            header: t('project-not-selected'),
            buttons: [t('ok')],
        })

}

const handleCreate = () => {
    openModal(IssueCreate)
}

watch([() => tt.project, () => tt.filter], () => handleRefresh())

onMounted(load)

</script>

<template>
    <IonPage>
        <IssuesFilters />

        <IonPage id="issues">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start" :collapse="true">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>{{ tt.filter?.label }}</IonTitle>
                    <IonButtons slot="end" :collapse="true">
                        <IonButton @click="handleCreate">
                            <IonIcon :icon="add"></IonIcon>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
                <IonToolbar>
                    <IonSearchbar v-model="search" :debounce="1000" @ionInput="handleSearch" />
                </IonToolbar>
                <IonProgressBar v-if="loading" type="indeterminate"></IonProgressBar>
            </IonHeader>
            <IonContent>
                <IonRefresher slot="fixed" @ionRefresh="handleRefresh($event)">
                    <IonRefresherContent />
                </IonRefresher>
                <IonList v-if="issues">
                    <IssueListItem v-for="issue of issues" :key="issue.id" :issue="issue" :projection="projection"
                        @click="handleOpen(issue)" />
                    <!-- <IonItem v-for="issue of issues" :key="issue.id" @click="handleOpen(issue)" button detail>
                        <IonLabel>{{ issue.issueId }} - {{ issue.subject }}</IonLabel>
                    </IonItem> -->
                </IonList>
                <IonInfiniteScroll v-if="skip < count" @ionInfinite="load">
                    <IonInfiniteScrollContent />
                </IonInfiniteScroll>
            </IonContent>
        </IonPage>
    </IonPage>
</template>

<style scoped></style>