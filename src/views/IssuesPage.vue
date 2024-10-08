<script setup lang="ts">
import IssuesFilters from '@/components/IssuesFilters.vue';
import { useTtStore } from '@/stores/ttStore';
import { InfiniteScrollCustomEvent, IonButtons, IonContent, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonMenu, IonMenuButton, IonPage, IonRefresher, IonRefresherContent, IonSearchbar, IonTitle, IonToolbar, RefresherCustomEvent } from '@ionic/vue';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const tt = useTtStore()
const { currentRoute, push } = useRouter()

const issues = ref<Issue[]>([])
const count = ref<number>(0)
const limit = ref<number>(40)
const skip = ref<number>(0)
const search = ref(currentRoute.value.query.search as string || '')

const load = async (event?: InfiniteScrollCustomEvent) => {
    if (!tt.filter)
        return
    try {
        const res = await tt.getIssues(limit.value, tt.filter.filter, skip.value, search.value);
        issues.value = Number(res.skip) === 0 ? res.issues : [...issues.value, ...res.issues]
        count.value = res.count
        limit.value = Number(res.limit)
        skip.value = Number(res.skip) + limit.value
        event?.target.complete()
    } catch (e) {
    }
}

const handleOpen = async (issue: Issue) => {
    await push({ name: 'issue', params: { id: issue.issueId } })
}

const handleRefresh = (event?: RefresherCustomEvent) => {
    skip.value = 0
    load()
        .then(() => event?.target.complete())
}

const handleSearch = () => {
    push({ query: { ...currentRoute.value.query, search: search.value } })
    handleRefresh()
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
                </IonToolbar>
                <IonToolbar>
                    <IonSearchbar v-model="search" :debounce="1000" @ionInput="handleSearch" />
                </IonToolbar>

            </IonHeader>
            <IonContent>
                <IonRefresher slot="fixed" @ionRefresh="handleRefresh($event)">
                    <IonRefresherContent />
                </IonRefresher>
                <IonList v-if="issues">
                    <IonItem v-for="issue of issues" :key="issue.id" @click="handleOpen(issue)" button detail>
                        <IonLabel>{{ issue.issueId }} - {{ issue.subject }}</IonLabel>
                    </IonItem>
                </IonList>
                <IonInfiniteScroll v-if="skip < count" @ionInfinite="load">
                    <IonInfiniteScrollContent />
                </IonInfiniteScroll>
            </IonContent>
        </IonPage>
    </IonPage>
</template>

<style scoped></style>