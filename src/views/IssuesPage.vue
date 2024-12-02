<script setup lang="ts">
import IssuesFilters from '@/components/IssuesFilters.vue';
import useAlert from '@/hooks/useAlert';
import useModal from '@/hooks/useModal';
import { useTtStore } from '@/stores/ttStore';
import {
    InfiniteScrollCustomEvent,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonList,
    IonMenuButton,
    IonPage,
    IonProgressBar,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    menuController,
    RefresherCustomEvent,
    ScrollCustomEvent
} from '@ionic/vue';
import { add } from 'ionicons/icons';
import { defineAsyncComponent, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const IssueCreate = defineAsyncComponent(() => import('@/components/IssueCreate.vue'));
const IssueListItem = defineAsyncComponent(() => import('@/components/IssueListItem.vue'));

const tt = useTtStore();
const { t } = useI18n();
const { currentRoute, push } = useRouter();
const { presentAlert } = useAlert();
const { openModal } = useModal();

const issues = ref<Issue[]>([]);
const projection = ref<Record<string, number>>({});
const count = ref<number>(0);
const limit = ref<number>(20);
const skip = ref<number>(0);
const search = ref(currentRoute.value.query.search as string || '');
const loading = ref(false);

const showSearchBar = ref(true);

const onScroll = (event: ScrollCustomEvent) => {
    const { scrollTop, deltaY: delta } = event.detail;

    if (scrollTop < 56)
        showSearchBar.value = true;
    else
        showSearchBar.value = false;
};

const load = async (event?: InfiniteScrollCustomEvent) => {
    try {
        loading.value = true;
        const res = await tt.getIssues({
            limit: limit.value,
            skip: skip.value,
            search: search.value
        });
        issues.value = Number(res.skip) === 0 ? res.issues : [...issues.value, ...res.issues];
        tt.projection = res.projection;
        projection.value = res.projection;
        count.value = res.count;
        limit.value = Number(res.limit);
        skip.value = Number(res.skip) + limit.value;
        event?.target.complete();
        return true;
    } catch (e) {
        console.warn(e);
        return false;
    } finally {
        loading.value = false;
    }
};

const handleOpen = async (issue: Issue) => {
    await push({ name: 'issue', params: { id: issue.issueId } });
};

const handleRefresh = (event?: RefresherCustomEvent) => {
    skip.value = 0;
    load()
        .then((r) => {
            if (r) menuController.close('issuesMenu');
        })
        .finally(() => event?.target.complete());
};

const handleSearch = () => {
    push({ query: { ...currentRoute.value.query, search: search.value } });
    if (tt.project) {
        handleRefresh();
    } else {
        presentAlert({
            header: t('project-not-selected'),
            buttons: [t('ok')]
        });
    }
};

const handleCreate = () => {
    openModal(IssueCreate);
};

watch(
    [() => tt.project, () => tt.filter, () => tt.sortBy],
    () => handleRefresh()
);

onMounted(load);
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
                            <IonIcon :icon="add" />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
                <IonToolbar :class="{ 'search-toolbar': true, 'hidden': !showSearchBar }">
                    <IonSearchbar v-model="search" :debounce="1000" @ionInput="handleSearch"
                        :placeholder="$t('search')" />
                </IonToolbar>
                <IonProgressBar v-if="loading" type="indeterminate" />
            </IonHeader>
            <IonContent scrollEvents @ionScroll="onScroll">
                <IonRefresher slot="fixed" @ionRefresh="handleRefresh($event)">
                    <IonRefresherContent />
                </IonRefresher>
                <IonList v-if="issues">
                    <IssueListItem v-for="issue in issues" :key="issue.id" :issue="issue" :projection="projection"
                        @click="handleOpen(issue)" />
                </IonList>
                <IonInfiniteScroll v-if="skip < count" @ionInfinite="load">
                    <IonInfiniteScrollContent />
                </IonInfiniteScroll>
            </IonContent>
        </IonPage>
    </IonPage>
</template>

<style scoped>
.search-toolbar {
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
    max-height: 56px;
    /* Высота тулбара */
}

.search-toolbar.hidden {
    max-height: 0;
}
</style>
