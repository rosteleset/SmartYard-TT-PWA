<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue';
import { useTtStore } from '@/stores/ttStore';
import { InfiniteScrollCustomEvent, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, RefresherCustomEvent } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const tt = useTtStore()
const { currentRoute, push } = useRouter()

const project = tt.getProjectByAcronym(currentRoute.value.query['project'] as string)
const filter = tt.getFilterWithLabel(currentRoute.value.query['filter'] as string)

const issues = ref<Issue[]>([])
const count = ref<number>(0)
const limit = ref<number>(40)
const skip = ref<number>(0)

const load = async (event?: InfiniteScrollCustomEvent) => {
    try {
        const res = await tt.getIssues(limit.value, filter.filter, skip.value);
        issues.value = Number(res.skip) === 0 ? res.issues : [...issues.value, ...res.issues]
        count.value = res.count
        limit.value = Number(res.limit)
        skip.value = Number(res.skip) + limit.value
        event?.target.complete()
    } catch (e) {

    }
}

const handler = async (issue: Issue) => {
    await push({ name: 'issue', params: { id: issue.issueId } })
}

const handleRefresh = (event: RefresherCustomEvent) => {
    skip.value = 0
    load()
        .then(() => event.target.complete())
}

onMounted(load)

</script>

<template>
    <IonPage>
        <PageHeader :label="`${filter.label}`" default-href="/tt/" />
        <IonContent>
            <IonRefresher slot="fixed" @ionRefresh="handleRefresh($event)">
                <IonRefresherContent />
            </IonRefresher>
            <IonList v-if="issues">
                <IonItem v-for="issue of issues" :key="issue.id" @click="handler(issue)" button detail>
                    <IonLabel>{{ issue.issueId }} - {{ issue.subject }}</IonLabel>
                </IonItem>
            </IonList>
            <IonInfiniteScroll v-if="skip < count" @ionInfinite="load">
                <IonInfiniteScrollContent />
            </IonInfiniteScroll>
        </IonContent>
    </IonPage>
</template>

<style scoped></style>