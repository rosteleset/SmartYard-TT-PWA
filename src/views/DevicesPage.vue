<script setup lang="ts">
import DeviceStatusBadge from '@/components/DeviceStatusBadge.vue';
import useModal from '@/hooks/useModal';
import useOperationsFeedback from '@/hooks/useOperationsFeedback';
import { useOperationsStore } from '@/stores/operationsStore';
import { useTtStore } from '@/stores/ttStore';
import { useUsersStore } from '@/stores/usersStore';
import type { RbtCamera, RbtDeviceListItem, RbtDomophone } from '@/types/operations';
import {
    cameraPlayerUrl,
    cameraStreamName,
    formatDateTime,
    isUnavailable,
} from '@/utils/operations';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonModal,
    IonNote,
    IonPage,
    IonProgressBar,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonTitle,
    IonToolbar,
    RefresherCustomEvent,
} from '@ionic/vue';
import {
    build,
    camera,
    createOutline,
    eye,
    eyeOff,
    power,
    refresh,
    server,
    sync,
    videocam,
} from 'ionicons/icons';
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

type Filter = 'all' | 'domophone' | 'camera' | 'offline';

const IssueCreate = defineAsyncComponent(() => import('@/components/IssueCreate.vue'));
const operations = useOperationsStore();
const tt = useTtStore();
const users = useUsersStore();
const { confirm, failure, toast } = useOperationsFeedback();
const { openModal } = useModal();
const { t } = useI18n();
const filter = ref<Filter>('all');
const query = ref('');
const selected = ref<RbtDeviceListItem | null>(null);
const actionLoading = ref(false);
const snapshotLoading = ref(false);
const snapshotUrl = ref('');
const snapshotError = ref(false);
const playerOpen = ref(false);
const playerUrl = ref('');
let snapshotRequest = 0;

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

const selectedCamera = computed<RbtCamera | null>(() =>
    selected.value?.type === 'camera' ? selected.value.raw as RbtCamera : null
);
const selectedDomophone = computed<RbtDomophone | null>(() =>
    selected.value?.type === 'domophone' ? selected.value.raw as RbtDomophone : null
);
const sesameSettings = computed(() => selectedCamera.value?.ext?.sesameDvr);
const selectedStreamName = computed(() =>
    selectedCamera.value ? cameraStreamName(selectedCamera.value) : ''
);
const dvrServer = computed(() => {
    try {
        return new URL(selectedCamera.value?.dvrStream || '').origin;
    } catch {
        return '';
    }
});
const hasPlayer = computed(() =>
    Boolean(selectedCamera.value && cameraPlayerUrl(selectedCamera.value))
);

const yesNo = (value: unknown) => Number(value) ? t('yes') : t('no');

async function load(event?: RefresherCustomEvent) {
    try {
        await operations.loadDevices();
        syncSelected();
    } catch (error) {
        await failure(error);
    } finally {
        event?.target.complete();
    }
}

function syncSelected() {
    if (!selected.value)
        return;
    selected.value = operations.devices.find(item => item.key === selected.value?.key) || null;
}

async function selectDevice(item: RbtDeviceListItem) {
    selected.value = item;
    snapshotUrl.value = '';
    snapshotError.value = false;
    if (item.type === 'camera')
        await loadCameraSnapshot();
}

function dismissDevice() {
    snapshotRequest += 1;
    selected.value = null;
    snapshotUrl.value = '';
    snapshotError.value = false;
    playerOpen.value = false;
    playerUrl.value = '';
}

async function loadCameraSnapshot(showFailure = false) {
    const cameraId = selectedCamera.value?.cameraId;
    if (!cameraId)
        return;

    const request = ++snapshotRequest;
    snapshotLoading.value = true;
    snapshotError.value = false;
    try {
        const shot = await operations.getCameraSnapshot(Number(cameraId));
        if (request !== snapshotRequest || Number(selectedCamera.value?.cameraId) !== Number(cameraId))
            return;
        snapshotUrl.value = shot ? `data:image/jpeg;base64,${shot}` : '';
        snapshotError.value = !shot;
    } catch (error) {
        if (request !== snapshotRequest)
            return;
        snapshotUrl.value = '';
        snapshotError.value = true;
        if (showFailure)
            await failure(error);
    } finally {
        if (request === snapshotRequest)
            snapshotLoading.value = false;
    }
}

async function refreshSelected() {
    actionLoading.value = true;
    try {
        await operations.loadDevices();
        syncSelected();
        if (selectedCamera.value)
            await loadCameraSnapshot();
        await toast(t('operations.devices.refreshed'));
    } catch (error) {
        await failure(error);
    } finally {
        actionLoading.value = false;
    }
}

async function runDomophoneAction(
    action: (domophone: RbtDomophone) => Promise<void>,
    successMessage: string,
) {
    const domophone = selectedDomophone.value;
    if (!domophone)
        return;
    actionLoading.value = true;
    try {
        await action(domophone);
        syncSelected();
        await toast(successMessage);
    } catch (error) {
        await failure(error);
    } finally {
        actionLoading.value = false;
    }
}

async function toggleAlwaysOpen() {
    if (!await confirm(t('confirmation'), t('operations.domophones.confirmAlwaysOpen')))
        return;
    await runDomophoneAction(
        domophone => operations.toggleAlwaysOpen(domophone),
        t('operations.devices.updated'),
    );
}

async function toggleEnabled() {
    const domophone = selectedDomophone.value;
    if (!domophone || !await confirm(t('confirmation'), t('operations.domophones.confirmEnabled')))
        return;
    await runDomophoneAction(
        value => operations.toggleDomophoneEnabled(value),
        domophone.enabled
            ? t('operations.domophones.disabled')
            : t('operations.domophones.enabled'),
    );
}

async function toggleMonitoring() {
    const domophone = selectedDomophone.value;
    if (!domophone || !await confirm(t('confirmation'), t('operations.domophones.confirmMonitoring')))
        return;
    await runDomophoneAction(
        value => operations.toggleDomophoneMonitoring(value),
        domophone.monitoring
            ? t('operations.domophones.monitoringDisabled')
            : t('operations.domophones.monitoringEnabled'),
    );
}

async function autoconfigure() {
    const domophone = selectedDomophone.value;
    if (!domophone || !await confirm(t('confirmation'), t('operations.domophones.confirmAutoconfigure')))
        return;
    await runDomophoneAction(
        value => operations.autoconfigureDomophone(Number(value.domophoneId)),
        t('operations.domophones.autoconfigureQueued'),
    );
}

async function createIssue() {
    const item = selected.value;
    if (!item)
        return;

    actionLoading.value = true;
    try {
        if (!tt.meta)
            await tt.load({});
        if (!users.users.length)
            await users.load();

        const deviceType = item.type === 'camera'
            ? t('operations.devices.camera')
            : t('operations.devices.domophone');
        const description = [
            `${t('operations.devices.issueDevice')}: ${deviceType}`,
            `${t('operations.common.id')}: ${item.id}`,
            `${t('operations.common.model')}: ${item.subtitle || '—'}`,
            `${t('operations.common.address')}: ${item.address || '—'}`,
        ].join('\n');

        await openModal(IssueCreate, {
            initialSubject: `${deviceType} #${item.id}: ${item.title}`,
            initialDescription: description,
        });
    } catch (error) {
        await failure(error);
    } finally {
        actionLoading.value = false;
    }
}

function openPlayer() {
    const camera = selectedCamera.value;
    if (!camera)
        return;
    const url = cameraPlayerUrl(camera);
    if (!url)
        return;
    playerUrl.value = url;
    playerOpen.value = true;
}

function reloadPlayer() {
    if (!playerUrl.value)
        return;
    const url = new URL(playerUrl.value);
    url.searchParams.set('_', String(Date.now()));
    playerUrl.value = url.toString();
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
                <IonItem v-for="item in filtered" :key="item.key" button detail @click="selectDevice(item)">
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
            @didDismiss="dismissDevice"
        >
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{{ selected?.title }}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton @click="dismissDevice">{{ $t('close') }}</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent v-if="selected">
                <section v-if="selectedCamera" class="camera-preview">
                    <div class="camera-frame">
                        <img v-if="snapshotUrl" :src="snapshotUrl" :alt="selected.title">
                        <IonSpinner v-else-if="snapshotLoading" />
                        <div v-else class="camera-placeholder">
                            <IonIcon :icon="videocam" />
                            <span>{{ snapshotError
                                ? $t('operations.cameras.snapshotUnavailable')
                                : $t('operations.cameras.snapshotEmpty') }}</span>
                        </div>
                    </div>
                    <IonButton
                        fill="clear"
                        size="small"
                        :disabled="snapshotLoading"
                        @click="loadCameraSnapshot(true)"
                    >
                        <IonIcon slot="start" :icon="refresh" />
                        {{ $t('operations.cameras.refreshSnapshot') }}
                    </IonButton>
                </section>

                <IonList inset>
                    <IonListHeader>
                        <IonLabel>{{ $t('info') }}</IonLabel>
                    </IonListHeader>
                    <IonItem>
                        <IonLabel>{{ $t('operations.common.id') }}</IonLabel>
                        <IonNote slot="end">{{ selected.id }}</IonNote>
                    </IonItem>
                    <IonItem>
                        <IonLabel>{{ $t('operations.common.model') }}</IonLabel>
                        <IonNote slot="end">{{ selected.subtitle || '—' }}</IonNote>
                    </IonItem>
                    <IonItem>
                        <IonLabel>{{ $t('status') }}</IonLabel>
                        <DeviceStatusBadge slot="end" :status="selected.status" />
                    </IonItem>

                    <template v-if="selectedDomophone">
                        <IonItem>
                            <IonLabel>{{ $t('operations.devices.enabledState') }}</IonLabel>
                            <IonNote slot="end">{{ yesNo(selectedDomophone.enabled) }}</IonNote>
                        </IonItem>
                        <IonItem>
                            <IonLabel>{{ $t('operations.devices.monitoring') }}</IonLabel>
                            <IonNote slot="end">{{ yesNo(selectedDomophone.monitoring) }}</IonNote>
                        </IonItem>
                        <IonItem v-if="selectedDomophone.ip">
                            <IonLabel>IP</IonLabel>
                            <IonNote slot="end">{{ selectedDomophone.ip }}</IonNote>
                        </IonItem>
                        <IonItem v-if="selectedDomophone.url">
                            <IonLabel>URL</IonLabel>
                            <IonNote slot="end" class="tech-value">{{ selectedDomophone.url }}</IonNote>
                        </IonItem>
                        <IonItem v-if="selectedDomophone.server">
                            <IonLabel>{{ $t('operations.domophones.sipServer') }}</IonLabel>
                            <IonNote slot="end" class="tech-value">{{ selectedDomophone.server }}</IonNote>
                        </IonItem>
                        <IonItem>
                            <IonLabel>NAT</IonLabel>
                            <IonNote slot="end">{{ yesNo(selectedDomophone.nat) }}</IonNote>
                        </IonItem>
                        <IonItem v-if="selectedDomophone.video">
                            <IonLabel>{{ $t('operations.domophones.videoMode') }}</IonLabel>
                            <IonNote slot="end">{{ selectedDomophone.video }}</IonNote>
                        </IonItem>
                        <IonItem v-if="selectedDomophone.dtmf">
                            <IonLabel>DTMF</IonLabel>
                            <IonNote slot="end">{{ selectedDomophone.dtmf }}</IonNote>
                        </IonItem>
                        <IonItem>
                            <IonLabel>{{ $t('operations.domophones.alwaysOpen') }}</IonLabel>
                            <IonNote slot="end">{{ yesNo(selectedDomophone.locksAreOpen) }}</IonNote>
                        </IonItem>
                        <IonItem v-if="selectedDomophone.comments">
                            <IonLabel>{{ $t('operations.devices.comments') }}</IonLabel>
                            <IonNote slot="end" class="tech-value">{{ selectedDomophone.comments }}</IonNote>
                        </IonItem>
                        <IonItem v-if="selectedDomophone.tree">
                            <IonLabel>{{ $t('operations.devices.location') }}</IonLabel>
                            <IonNote slot="end" class="tech-value">{{ selectedDomophone.tree }}</IonNote>
                        </IonItem>
                    </template>

                    <template v-if="selectedCamera">
                        <IonItem>
                            <IonLabel>{{ $t('operations.devices.enabledState') }}</IonLabel>
                            <IonNote slot="end">{{ yesNo(selectedCamera.enabled) }}</IonNote>
                        </IonItem>
                        <IonItem>
                            <IonLabel>{{ $t('operations.devices.monitoring') }}</IonLabel>
                            <IonNote slot="end">{{ yesNo(selectedCamera.monitoring) }}</IonNote>
                        </IonItem>
                        <IonItem v-if="selectedCamera.ip">
                            <IonLabel>IP</IonLabel>
                            <IonNote slot="end">{{ selectedCamera.ip }}</IonNote>
                        </IonItem>
                        <IonItem v-if="selectedCamera.url">
                            <IonLabel>URL</IonLabel>
                            <IonNote slot="end" class="tech-value">{{ selectedCamera.url }}</IonNote>
                        </IonItem>
                        <IonItem v-if="dvrServer">
                            <IonLabel>DVR</IonLabel>
                            <IonNote slot="end" class="tech-value">{{ dvrServer }}</IonNote>
                        </IonItem>
                        <IonItem v-if="selectedStreamName">
                            <IonLabel>{{ $t('operations.cameras.streamName') }}</IonLabel>
                            <IonNote slot="end" class="tech-value">{{ selectedStreamName }}</IonNote>
                        </IonItem>
                        <IonItem v-if="sesameSettings?.displayName">
                            <IonLabel>{{ $t('operations.cameras.displayName') }}</IonLabel>
                            <IonNote slot="end" class="tech-value">{{ sesameSettings.displayName }}</IonNote>
                        </IonItem>
                        <IonItem v-if="sesameSettings?.retentionDays">
                            <IonLabel>{{ $t('operations.cameras.retention') }}</IonLabel>
                            <IonNote slot="end">{{ sesameSettings.retentionDays }}</IonNote>
                        </IonItem>
                        <IonItem v-if="sesameSettings?.lastSyncAt">
                            <IonLabel>{{ $t('operations.cameras.lastSync') }}</IonLabel>
                            <IonNote slot="end">{{ formatDateTime(sesameSettings.lastSyncAt) }}</IonNote>
                        </IonItem>
                        <IonItem v-if="sesameSettings?.lastSyncError">
                            <IonLabel>{{ $t('operations.cameras.syncError') }}</IonLabel>
                            <IonNote slot="end" color="danger" class="tech-value">{{ sesameSettings.lastSyncError }}</IonNote>
                        </IonItem>
                        <IonItem v-if="selectedCamera.comments">
                            <IonLabel>{{ $t('operations.devices.comments') }}</IonLabel>
                            <IonNote slot="end" class="tech-value">{{ selectedCamera.comments }}</IonNote>
                        </IonItem>
                    </template>
                </IonList>

                <IonList inset>
                    <IonListHeader>
                        <IonLabel>{{ $t('actions') }}</IonLabel>
                    </IonListHeader>
                    <IonItem button :disabled="actionLoading" @click="refreshSelected">
                        <IonIcon slot="start" :icon="refresh" />
                        <IonLabel>{{ $t('operations.devices.refreshStatus') }}</IonLabel>
                    </IonItem>
                    <template v-if="selectedDomophone">
                        <IonItem button :disabled="actionLoading" @click="toggleEnabled">
                            <IonIcon slot="start" :icon="power" />
                            <IonLabel>{{ selectedDomophone.enabled
                                ? $t('operations.domophones.disable')
                                : $t('operations.domophones.enable') }}</IonLabel>
                        </IonItem>
                        <IonItem button :disabled="actionLoading" @click="toggleMonitoring">
                            <IonIcon slot="start" :icon="selectedDomophone.monitoring ? eyeOff : eye" />
                            <IonLabel>{{ selectedDomophone.monitoring
                                ? $t('operations.domophones.disableMonitoring')
                                : $t('operations.domophones.enableMonitoring') }}</IonLabel>
                        </IonItem>
                        <IonItem button :disabled="actionLoading" @click="toggleAlwaysOpen">
                            <IonIcon slot="start" :icon="selectedDomophone.locksAreOpen ? eyeOff : eye" />
                            <IonLabel>{{ selectedDomophone.locksAreOpen
                                ? $t('operations.domophones.disableAlwaysOpen')
                                : $t('operations.domophones.enableAlwaysOpen') }}</IonLabel>
                        </IonItem>
                        <IonItem button :disabled="actionLoading" @click="autoconfigure">
                            <IonIcon slot="start" :icon="build" />
                            <IonLabel>{{ $t('operations.domophones.autoconfigure') }}</IonLabel>
                        </IonItem>
                    </template>
                    <IonItem v-if="selectedCamera && hasPlayer" button :disabled="actionLoading" @click="openPlayer">
                        <IonIcon slot="start" :icon="videocam" />
                        <IonLabel>{{ $t('operations.cameras.openPlayer') }}</IonLabel>
                    </IonItem>
                    <IonItem button :disabled="actionLoading" @click="createIssue">
                        <IonIcon slot="start" :icon="createOutline" />
                        <IonLabel>{{ $t('operations.devices.createIssue') }}</IonLabel>
                    </IonItem>
                </IonList>
            </IonContent>
        </IonModal>

        <IonModal :is-open="playerOpen" @didDismiss="playerOpen = false">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{{ selected?.title }}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton @click="reloadPlayer">
                            <IonIcon slot="icon-only" :icon="sync" />
                        </IonButton>
                        <IonButton @click="playerOpen = false">{{ $t('close') }}</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent class="player-content">
                <iframe
                    v-if="playerUrl"
                    class="player-frame"
                    :src="playerUrl"
                    :title="$t('operations.cameras.playerTitle')"
                    allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen
                />
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

.device-filters ion-segment-button {
    min-width: 0;
    font-size: 11px;
}

.camera-preview {
    padding: 16px 16px 0;
    text-align: center;
}

.camera-frame {
    position: relative;
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 8px;
    background: #111;
    color: var(--ion-color-medium);
}

.camera-frame img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.camera-placeholder {
    display: grid;
    gap: 8px;
    justify-items: center;
}

.camera-placeholder ion-icon {
    font-size: 36px;
}

ion-note.tech-value {
    max-width: 62%;
    overflow-wrap: anywhere;
    text-align: right;
    white-space: normal;
}

.player-frame {
    width: 100%;
    height: 100%;
    border: 0;
    background: #000;
}

.player-content {
    --background: #000;
}
</style>
