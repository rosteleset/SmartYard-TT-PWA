<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue';
import useOperationsFeedback from '@/hooks/useOperationsFeedback';
import { useOperationsStore } from '@/stores/operationsStore';
import type { RbtFlat } from '@/types/operations';
import {
    IonBadge,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonNote,
    IonPage,
    IonProgressBar,
    IonRefresher,
    IonRefresherContent,
    RefresherCustomEvent,
} from '@ionic/vue';
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const operations = useOperationsStore();
const { failure } = useOperationsFeedback();
const route = useRoute();
const router = useRouter();
const houseId = computed(() => Number(route.params.id));
const title = computed(() => operations.selectedHouse?.houseFull || String(route.query.title || '') || `#${houseId.value}`);
const flats = computed(() => [...(operations.houseData?.flats || [])].sort((left, right) =>
    String(left.flat || '').localeCompare(String(right.flat || ''), undefined, { numeric: true })
));

async function load(event?: RefresherCustomEvent) {
    try {
        await operations.loadHouse(houseId.value, String(route.query.title || ''));
    } catch (error) {
        await failure(error);
    } finally {
        event?.target.complete();
    }
}

function blocked(flat: RbtFlat) {
    return Boolean(flat.manualBlock || flat.adminBlock || flat.autoBlock);
}

async function openFlat(flat: RbtFlat) {
    await router.push({
        name: 'flat',
        params: { id: flat.flatId },
        query: { houseId: houseId.value, title: title.value },
    });
}

onMounted(load);
watch(houseId, () => load());
</script>

<template>
    <IonPage>
        <PageHeader :label="title" default-href="/houses" />
        <IonProgressBar v-if="operations.houseLoading" type="indeterminate" />
        <IonContent>
            <IonRefresher slot="fixed" @ionRefresh="load($event)">
                <IonRefresherContent />
            </IonRefresher>

            <IonList v-if="operations.houseData" inset>
                <IonItem>
                    <IonLabel>{{ $t('operations.houses.flats') }}</IonLabel>
                    <IonNote slot="end">{{ operations.houseData.flats.length }}</IonNote>
                </IonItem>
                <IonItem>
                    <IonLabel>{{ $t('operations.devices.cameras') }}</IonLabel>
                    <IonNote slot="end">{{ operations.houseData.cameras.length }}</IonNote>
                </IonItem>
                <IonItem>
                    <IonLabel>{{ $t('operations.houses.entrances') }}</IonLabel>
                    <IonNote slot="end">{{ operations.houseData.entrances.length }}</IonNote>
                </IonItem>
            </IonList>

            <IonList v-if="flats.length" inset>
                <IonListHeader>{{ $t('operations.houses.flats') }}</IonListHeader>
                <IonItem v-for="flat in flats" :key="flat.flatId" button detail @click="openFlat(flat)">
                    <IonLabel>
                        <h2>{{ $t('operations.flats.flat') }} {{ flat.flat || flat.flatId }}</h2>
                        <p>{{ $t('operations.flats.floor') }}: {{ flat.floor || '—' }} · ID {{ flat.flatId }}</p>
                    </IonLabel>
                    <IonBadge v-if="blocked(flat)" slot="end" color="warning">{{ $t('operations.flats.blocked') }}</IonBadge>
                </IonItem>
            </IonList>
        </IonContent>
    </IonPage>
</template>
