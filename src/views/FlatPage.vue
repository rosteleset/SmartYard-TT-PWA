<script setup lang="ts">
import DeviceStatusBadge from '@/components/DeviceStatusBadge.vue';
import KeyEditorModal from '@/components/KeyEditorModal.vue';
import PageHeader from '@/components/PageHeader.vue';
import SubscriberEditorModal from '@/components/SubscriberEditorModal.vue';
import useOperationsFeedback from '@/hooks/useOperationsFeedback';
import { useOperationsStore } from '@/stores/operationsStore';
import type {
    KeyFormValue,
    RbtDomophone,
    RbtSubscriber,
    SubscriberFormValue,
} from '@/types/operations';
import {
    flatEntranceModels,
    formatDateTime,
    formatDevice,
    formatSubscriberName,
    latestSubscriberDevice,
    subscriberRole,
} from '@/utils/operations';
import {
    IonBadge,
    IonButton,
    IonContent,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
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
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const operations = useOperationsStore();
const { confirm, failure, toast } = useOperationsFeedback();
const { t } = useI18n();
const route = useRoute();

const flatId = computed(() => Number(route.params.id));
const houseId = computed(() => Number(route.query.houseId || operations.selectedHouse?.houseId || 0));
const houseTitle = computed(() => operations.selectedHouse?.houseFull || String(route.query.title || ''));
const label = computed(() => `${t('operations.flats.flat')} ${operations.flatData?.flat || flatId.value}`);
const entrances = computed(() => operations.flatData
    ? flatEntranceModels(operations.flatData, operations.houseData, operations.flatDomophones)
    : []
);

const keyModalOpen = ref(false);
const subscriberModalOpen = ref(false);
const selectedSubscriber = ref<RbtSubscriber | null>(null);
const saving = ref(false);
const action = ref('');

async function load(event?: RefresherCustomEvent) {
    try {
        if (houseId.value && (!operations.houseData || Number(operations.selectedHouse?.houseId) !== houseId.value))
            await operations.loadHouse(houseId.value, houseTitle.value);
        await operations.loadFlat(flatId.value);
    } catch (error) {
        await failure(error);
    } finally {
        event?.target.complete();
    }
}

async function perform(name: string, operation: () => Promise<void>, successKey?: string) {
    action.value = name;
    try {
        await operation();
        if (successKey)
            await toast(t(successKey));
    } catch (error) {
        await failure(error);
    } finally {
        action.value = '';
    }
}

async function toggleBlock() {
    if (!await confirm(t('confirmation'), t('operations.flats.confirmBlock')))
        return;
    await perform('block', operations.toggleAdminBlock, 'operations.flats.blockUpdated');
}

async function generateCode() {
    if (!await confirm(t('confirmation'), t('operations.flats.confirmGenerateCode')))
        return;
    await perform('code', operations.generateOpenCode, 'operations.flats.codeGenerated');
}

async function disableCode() {
    if (!await confirm(t('confirmation'), t('operations.flats.confirmDisableCode'), true))
        return;
    await perform('code', operations.disableOpenCode, 'operations.flats.codeDisabled');
}

async function openDoor(domophoneId: number, doorId: number) {
    if (!await confirm(t('confirmation'), t('operations.domophones.confirmOpen')))
        return;
    await perform(`door-${domophoneId}`, () => operations.openDoor(domophoneId, doorId), 'operations.domophones.opened');
}

async function toggleAlwaysOpen(domophone: RbtDomophone) {
    if (!await confirm(t('confirmation'), t('operations.domophones.confirmAlwaysOpen')))
        return;
    await perform(`always-${domophone.domophoneId}`, () => operations.toggleAlwaysOpen(domophone), 'operations.devices.updated');
}

function addSubscriber() {
    selectedSubscriber.value = null;
    subscriberModalOpen.value = true;
}

function editSubscriber(subscriber: RbtSubscriber) {
    selectedSubscriber.value = subscriber;
    subscriberModalOpen.value = true;
}

async function saveSubscriber(value: SubscriberFormValue) {
    saving.value = true;
    try {
        await operations.saveSubscriber(value, selectedSubscriber.value);
        subscriberModalOpen.value = false;
        await toast(t('operations.subscribers.saved'));
    } catch (error) {
        await failure(error);
    } finally {
        saving.value = false;
    }
}

async function removeSubscriber(subscriber: RbtSubscriber) {
    if (!await confirm(t('confirmation'), t('operations.subscribers.confirmRemove'), true))
        return;
    await perform(`subscriber-${subscriber.subscriberId}`, () => operations.removeSubscriber(subscriber.subscriberId), 'operations.subscribers.removed');
}

async function saveKey(value: KeyFormValue) {
    saving.value = true;
    try {
        await operations.saveKey(value);
        keyModalOpen.value = false;
        await toast(t('operations.keys.saved'));
    } catch (error) {
        await failure(error);
    } finally {
        saving.value = false;
    }
}

async function removeKey(keyId: number) {
    if (!await confirm(t('confirmation'), t('operations.keys.confirmRemove'), true))
        return;
    await perform(`key-${keyId}`, () => operations.removeKey(keyId), 'operations.keys.removed');
}

onMounted(load);
watch(flatId, () => load());
</script>

<template>
    <IonPage>
        <PageHeader :label="label" :default-href="houseId ? `/house/${houseId}` : '/houses'" />
        <IonProgressBar v-if="operations.flatLoading" type="indeterminate" />
        <IonContent>
            <IonRefresher slot="fixed" @ionRefresh="load($event)">
                <IonRefresherContent />
            </IonRefresher>

            <template v-if="operations.flatData">
                <IonList inset>
                    <IonItem v-if="houseTitle">
                        <IonLabel>{{ $t('operations.common.address') }}</IonLabel>
                        <IonNote slot="end" class="wide-note">{{ houseTitle }}</IonNote>
                    </IonItem>
                    <IonItem>
                        <IonLabel>{{ $t('operations.flats.floor') }}</IonLabel>
                        <IonNote slot="end">{{ operations.flatData.floor || '—' }}</IonNote>
                    </IonItem>
                    <IonItem>
                        <IonLabel>{{ $t('operations.flats.openCode') }}</IonLabel>
                        <IonNote slot="end">{{ operations.flatData.openCode || '—' }}</IonNote>
                    </IonItem>
                    <IonItem>
                        <IonLabel>{{ $t('operations.flats.lastOpened') }}</IonLabel>
                        <IonNote slot="end">{{ formatDateTime(operations.flatData.lastOpened) }}</IonNote>
                    </IonItem>
                    <IonItem>
                        <IonLabel>{{ $t('operations.flats.sip') }}</IonLabel>
                        <IonBadge slot="end" :color="operations.flatData.sipEnabled ? 'success' : 'medium'">
                            {{ operations.flatData.sipEnabled ? $t('yes') : $t('no') }}
                        </IonBadge>
                    </IonItem>
                </IonList>

                <div class="action-grid ion-padding-horizontal">
                    <IonButton :disabled="Boolean(action)" @click="toggleBlock">
                        {{ operations.flatData.adminBlock ? $t('operations.flats.unblock') : $t('operations.flats.block') }}
                    </IonButton>
                    <IonButton fill="outline" :disabled="Boolean(action)" @click="generateCode">
                        {{ $t('operations.flats.generateCode') }}
                    </IonButton>
                    <IonButton fill="clear" color="danger" :disabled="Boolean(action) || !operations.flatData.openCode" @click="disableCode">
                        {{ $t('operations.flats.disableCode') }}
                    </IonButton>
                </div>

                <IonList inset>
                    <IonListHeader>{{ $t('operations.domophones.flatTitle') }}</IonListHeader>
                    <IonItem v-for="entrance in entrances" :key="`${entrance.entranceId}-${entrance.domophoneId}`">
                        <div class="item-content">
                            <div class="item-title-row">
                                <IonLabel>
                                    <h2>{{ entrance.domophone.name || `${$t('operations.devices.domophone')} #${entrance.domophoneId}` }}</h2>
                                    <p>{{ entrance.entranceName }} · {{ $t('operations.domophones.door') }} {{ entrance.doorId }}</p>
                                </IonLabel>
                                <DeviceStatusBadge :status="entrance.status" />
                            </div>
                            <div class="inline-actions">
                                <IonButton size="small" :disabled="Boolean(action)" @click="openDoor(entrance.domophoneId, entrance.doorId)">
                                    {{ $t('operations.domophones.open') }}
                                </IonButton>
                                <IonButton size="small" fill="outline" :disabled="Boolean(action)" @click="toggleAlwaysOpen(entrance.domophone)">
                                    {{ entrance.domophone.locksAreOpen
                                        ? $t('operations.domophones.disableAlwaysOpen')
                                        : $t('operations.domophones.enableAlwaysOpen') }}
                                </IonButton>
                            </div>
                        </div>
                    </IonItem>
                    <IonItem v-if="!entrances.length">
                        <IonNote>{{ $t('operations.domophones.empty') }}</IonNote>
                    </IonItem>
                </IonList>

                <IonList inset>
                    <IonListHeader>
                        <IonLabel>{{ $t('operations.keys.title') }}</IonLabel>
                        <IonButton @click="keyModalOpen = true">{{ $t('operations.common.add') }}</IonButton>
                    </IonListHeader>
                    <IonItemSliding v-for="key in operations.flatKeys" :key="key.keyId">
                        <IonItem>
                            <IonLabel>
                                <h2>{{ key.comments || key.rfId }}</h2>
                                <p>{{ key.rfId }}</p>
                                <p>{{ $t('operations.keys.lastSeen') }}: {{ formatDateTime(key.lastSeen) }}</p>
                            </IonLabel>
                        </IonItem>
                        <IonItemOptions side="end">
                            <IonItemOption color="danger" @click="removeKey(key.keyId)">{{ $t('delete') }}</IonItemOption>
                        </IonItemOptions>
                    </IonItemSliding>
                    <IonItem v-if="!operations.flatKeys.length">
                        <IonNote>{{ $t('operations.keys.empty') }}</IonNote>
                    </IonItem>
                </IonList>

                <IonList inset>
                    <IonListHeader>
                        <IonLabel>{{ $t('operations.subscribers.title') }}</IonLabel>
                        <IonButton @click="addSubscriber">{{ $t('operations.common.add') }}</IonButton>
                    </IonListHeader>
                    <IonItemSliding v-for="subscriber in operations.flatSubscribers" :key="subscriber.subscriberId">
                        <IonItem button detail @click="editSubscriber(subscriber)">
                            <IonLabel>
                                <h2>{{ formatSubscriberName(subscriber) }}</h2>
                                <p>{{ subscriber.mobile || '—' }}</p>
                                <p>{{ formatDevice(latestSubscriberDevice(operations.flatDevices, subscriber.subscriberId)) }}</p>
                            </IonLabel>
                            <IonBadge slot="end" color="medium">
                                {{ subscriberRole(subscriber, flatId) === 'owner'
                                    ? $t('operations.subscribers.owner')
                                    : $t('operations.subscribers.resident') }}
                            </IonBadge>
                        </IonItem>
                        <IonItemOptions side="end">
                            <IonItemOption color="danger" @click="removeSubscriber(subscriber)">{{ $t('delete') }}</IonItemOption>
                        </IonItemOptions>
                    </IonItemSliding>
                    <IonItem v-if="!operations.flatSubscribers.length">
                        <IonNote>{{ $t('operations.subscribers.empty') }}</IonNote>
                    </IonItem>
                </IonList>
            </template>
        </IonContent>

        <KeyEditorModal
            :open="keyModalOpen"
            :saving="saving"
            @dismiss="keyModalOpen = false"
            @save="saveKey"
        />
        <SubscriberEditorModal
            :open="subscriberModalOpen"
            :saving="saving"
            :subscriber="selectedSubscriber"
            :flat-id="flatId"
            @dismiss="subscriberModalOpen = false"
            @save="saveSubscriber"
        />
    </IonPage>
</template>

<style scoped>
.action-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.action-grid ion-button:last-child {
    grid-column: 1 / -1;
}

.item-content {
    width: 100%;
    padding: 12px 0;
}

.item-title-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
}

.inline-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
}

.wide-note {
    max-width: 65%;
    text-align: right;
    white-space: normal;
}

@media (max-width: 390px) {
    .action-grid {
        grid-template-columns: 1fr;
    }

    .action-grid ion-button:last-child {
        grid-column: auto;
    }
}
</style>
