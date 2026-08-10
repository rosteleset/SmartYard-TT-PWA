<script setup lang="ts">
import DeviceStatusBadge from '@/components/DeviceStatusBadge.vue';
import useOperationsFeedback from '@/hooks/useOperationsFeedback';
import { useOperationsStore } from '@/stores/operationsStore';
import type { RbtDeviceListItem, RbtDomophone } from '@/types/operations';
import { isUnavailable } from '@/utils/operations';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonNote,
    IonPage,
    IonProgressBar,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
    RefresherCustomEvent,
} from '@ionic/vue';
import { camera, refresh, server } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

type Filter = 'all' | 'domophone' | 'camera' | 'offline';

const operations = useOperationsStore();
const { failure, toast } = useOperationsFeedback();
const { t } = useI18n();
const filter = ref<Filter>('all');
const query = ref('');
const selected = ref<RbtDeviceListItem | null>(null);
const actionLoading = ref(false);

const filtered = computed(() => {
    const search = query.value.trim().toLowerCase();
    return operations.devices.filter(item => {
        if (filter.value === 'camera' && item.type !== 'camera')
            return false;
        if (filter.value === 'domophone' && item.type !== 'domophone')
            return false;
        if (filter.value === 'offline' && !isUnavailable(item))
            return false;
        return !search || [item.title, item.subtitle, item.address, item.id]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(search);
    });
});

async function load(event?: RefresherCustomEvent) {
    try {
        await operations.loadDevices();
    } catch (error) {
        await failure(error);
    } finally {
        event?.target.complete();
    }
}

async function toggleAlwaysOpen() {
    if (!selected.value || selected.value.type !== 'domophone')
        return;
    actionLoading.value = true;
    try {
        await operations.toggleAlwaysOpen(selected.value.raw as RbtDomophone);
        selected.value = operations.devices.find(item => item.key === selected.value?.key) || null;
        await toast(t('operations.devices.updated'));
    } catch (error) {
        await failure(error);
    } finally {
        actionLoading.value = false;
    }
}

onMounted(load);
</script>

<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>{{ $t('operations.devices.title') }}</IonTitle>
                <IonButtons slot="end">
                    <IonButton :disabled="operations.devicesLoading" @click="load()">
                        <IonIcon slot="icon-only" :icon="refresh" />
                    </IonButton>
                </IonButtons>
            </IonToolbar>
            <IonToolbar>
                <IonSearchbar v-model="query" :placeholder="$t('operations.devices.search')" />
            </IonToolbar>
            <IonToolbar>
                <IonSegment v-model="filter" class="device-filters" scrollable>
                    <IonSegmentButton value="all">{{ $t('operations.devices.all') }}</IonSegmentButton>
                    <IonSegmentButton value="domophone">{{ $t('operations.devices.domophones') }}</IonSegmentButton>
                    <IonSegmentButton value="camera">{{ $t('operations.devices.cameras') }}</IonSegmentButton>
                    <IonSegmentButton value="offline">{{ $t('operations.devices.problems') }}</IonSegmentButton>
                </IonSegment>
            </IonToolbar>
            <IonProgressBar v-if="operations.devicesLoading" type="indeterminate" />
        </IonHeader>

        <IonContent>
            <IonRefresher slot="fixed" @ionRefresh="load($event)">
                <IonRefresherContent />
            </IonRefresher>

            <IonList v-if="filtered.length" inset>
                <IonItem v-for="item in filtered" :key="item.key" button detail @click="selected = item">
                    <IonIcon slot="start" :icon="item.type === 'camera' ? camera : server" color="primary" />
                    <IonLabel>
                        <h2>{{ item.title }}</h2>
                        <p>{{ item.type === 'camera' ? $t('operations.devices.camera') : $t('operations.devices.domophone') }}<span v-if="item.subtitle"> · {{ item.subtitle }}</span></p>
                        <p v-if="item.address">{{ item.address }}</p>
                        <p v-if="item.status?.message">{{ item.status.message }}</p>
                    </IonLabel>
                    <DeviceStatusBadge slot="end" :status="item.status" />
                </IonItem>
            </IonList>
            <div v-else-if="!operations.devicesLoading" class="empty-state">
                <IonIcon :icon="camera" />
                <p>{{ $t('operations.devices.empty') }}</p>
            </div>
        </IonContent>

        <IonModal
            :is-open="Boolean(selected)"
            :initial-breakpoint="0.72"
            :breakpoints="[0, 0.5, 0.72, 1]"
            :handle="true"
            @didDismiss="selected = null"
        >
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{{ selected?.title }}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton @click="selected = null">{{ $t('close') }}</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent v-if="selected">
                <IonList inset>
                    <IonItem>
                        <IonLabel>{{ $t('operations.common.id') }}</IonLabel>
                        <IonNote slot="end">{{ selected.id }}</IonNote>
                    </IonItem>
                    <IonItem>
                        <IonLabel>{{ $t('operations.common.model') }}</IonLabel>
                        <IonNote slot="end">{{ selected.subtitle || '—' }}</IonNote>
                    </IonItem>
                    <IonItem v-if="selected.address">
                        <IonLabel>{{ $t('operations.common.address') }}</IonLabel>
                        <IonNote slot="end" class="ion-text-wrap">{{ selected.address }}</IonNote>
                    </IonItem>
                    <IonItem>
                        <IonLabel>{{ $t('status') }}</IonLabel>
                        <DeviceStatusBadge slot="end" :status="selected.status" />
                    </IonItem>
                </IonList>
                <div v-if="selected.type === 'domophone'" class="ion-padding-horizontal">
                    <IonButton expand="block" fill="outline" :disabled="actionLoading" @click="toggleAlwaysOpen">
                        {{ (selected.raw as RbtDomophone).locksAreOpen
                            ? $t('operations.domophones.disableAlwaysOpen')
                            : $t('operations.domophones.enableAlwaysOpen') }}
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    </IonPage>
</template>

<style scoped>
.empty-state {
    min-height: 45vh;
    display: grid;
    place-content: center;
    justify-items: center;
    color: var(--ion-color-medium);
    text-align: center;
}

.empty-state ion-icon {
    font-size: 42px;
}

ion-note.ion-text-wrap {
    max-width: 60%;
    text-align: right;
}

.device-filters ion-segment-button {
    min-width: 0;
    font-size: 11px;
}
</style>
