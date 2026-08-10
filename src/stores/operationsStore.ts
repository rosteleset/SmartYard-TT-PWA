import type {
    KeyFormValue,
    RbtCamera,
    RbtDeviceListItem,
    RbtDomophone,
    RbtFlat,
    RbtHouse,
    RbtHouseSummary,
    RbtKey,
    RbtSubscriber,
    RbtSubscriberDevice,
    SubscriberFormValue,
} from '@/types/operations';
import api from '@/utils/api';
import {
    buildSubscriberFlatsPatch,
    domophonePayload,
    normalizeRfid,
} from '@/utils/operations';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useOperationsStore = defineStore('operations', () => {
    const cameras = ref<RbtCamera[]>([]);
    const domophones = ref<RbtDomophone[]>([]);
    const devicesLoading = ref(false);

    const houseQuery = ref('');
    const houseResults = ref<RbtHouseSummary[]>([]);
    const houseLoading = ref(false);
    const selectedHouse = ref<RbtHouseSummary | null>(null);
    const houseData = ref<RbtHouse | null>(null);

    const flatLoading = ref(false);
    const flatData = ref<RbtFlat | null>(null);
    const flatSubscribers = ref<RbtSubscriber[]>([]);
    const flatKeys = ref<RbtKey[]>([]);
    const flatDevices = ref<RbtSubscriberDevice[]>([]);
    const flatDomophones = ref<RbtDomophone[]>([]);

    let houseRequest = 0;
    let flatRequest = 0;

    const devices = computed<RbtDeviceListItem[]>(() => [
        ...domophones.value.map(device => ({
            key: `domophone-${device.domophoneId}`,
            id: Number(device.domophoneId),
            type: 'domophone' as const,
            title: device.name || `#${device.domophoneId}`,
            subtitle: device.model || '',
            address: device.ip || device.url || device.server || '',
            status: device.status,
            raw: device,
        })),
        ...cameras.value.map(device => ({
            key: `camera-${device.cameraId}`,
            id: Number(device.cameraId),
            type: 'camera' as const,
            title: device.name || `#${device.cameraId}`,
            subtitle: device.model || '',
            address: device.ip || device.url || device.dvrStream || '',
            status: device.status,
            raw: device,
        })),
    ]);

    async function loadDevices() {
        devicesLoading.value = true;
        try {
            const [cameraResponse, domophoneResponse] = await Promise.all([
                api.GET('cameras/cameras', { _refresh: '1' }),
                api.GET('houses/domophones', { _refresh: '1' }),
            ]);
            cameras.value = cameraResponse?.cameras?.cameras || [];
            domophones.value = domophoneResponse?.domophones?.domophones || [];
        } finally {
            devicesLoading.value = false;
        }
    }

    async function searchHouses(query: string) {
        houseQuery.value = query.trim();
        if (houseQuery.value.length < 3) {
            houseResults.value = [];
            return;
        }
        const response = await api.GET('houses/search', { search: houseQuery.value });
        houseResults.value = response?.houses || [];
    }

    function selectHouse(house: RbtHouseSummary) {
        selectedHouse.value = house;
        houseData.value = null;
        clearFlat();
    }

    async function loadHouse(houseId: number, fallbackTitle?: string) {
        const request = ++houseRequest;
        houseLoading.value = true;
        if (!selectedHouse.value || Number(selectedHouse.value.houseId) !== Number(houseId)) {
            selectedHouse.value = {
                houseId,
                houseFull: fallbackTitle || undefined,
            };
        }
        houseData.value = null;
        clearFlat();

        try {
            const response = await api.GET(`houses/house/${houseId}`, { _refresh: '1' });
            if (request === houseRequest)
                houseData.value = response?.house || null;
        } finally {
            if (request === houseRequest)
                houseLoading.value = false;
        }
    }

    async function loadFlat(flatId: number) {
        const request = ++flatRequest;
        flatLoading.value = true;
        flatData.value = null;
        flatSubscribers.value = [];
        flatKeys.value = [];
        flatDevices.value = [];
        flatDomophones.value = [];

        try {
            const [flatResponse, subscriberResponse, deviceResponse, domophoneResponse] = await Promise.all([
                api.GET(`houses/flat/${flatId}`, { _refresh: '1' }),
                api.GET('subscribers/subscribers', { by: 'flatId', query: flatId, _refresh: '1' }),
                api.GET('subscribers/devices', { by: 'flat', query: flatId, _refresh: '1' }),
                api.GET('houses/domophones', { by: 'flat', query: flatId, _refresh: '1' }),
            ]);

            if (request !== flatRequest)
                return;

            flatData.value = flatResponse?.flat || null;
            flatSubscribers.value = (subscriberResponse?.subscribers || []).filter((subscriber: RbtSubscriber) =>
                !subscriber.flats?.length || subscriber.flats.some(flat => Number(flat.flatId) === Number(flatId))
            );
            flatKeys.value = subscriberResponse?.keys || [];
            flatDevices.value = (deviceResponse?.devices || []).filter((device: RbtSubscriberDevice) =>
                !device.flats?.length || device.flats.some(flat => Number(flat.flatId) === Number(flatId))
            );
            flatDomophones.value = domophoneResponse?.domophones?.domophones || [];
        } finally {
            if (request === flatRequest)
                flatLoading.value = false;
        }
    }

    async function refreshFlat() {
        if (flatData.value)
            await loadFlat(Number(flatData.value.flatId));
    }

    async function toggleAdminBlock() {
        if (!flatData.value)
            return;
        await api.PUT(`houses/flat/${flatData.value.flatId}`, {
            adminBlock: flatData.value.adminBlock ? 0 : 1,
        });
        await refreshFlat();
    }

    async function generateOpenCode() {
        if (!flatData.value)
            return;
        await api.PUT(`houses/flat/${flatData.value.flatId}`, { openCode: '!' });
        await refreshFlat();
    }

    async function disableOpenCode() {
        if (!flatData.value)
            return;
        await api.PUT(`houses/flat/${flatData.value.flatId}`, { openCode: '00000' });
        await refreshFlat();
    }

    async function openDoor(domophoneId: number, doorId: number) {
        await api.PUT(`houses/domophone/${domophoneId}`, {
            action: 'openLock',
            doorId,
        });
    }

    async function updateDomophone(domophone: RbtDomophone, overrides: Partial<RbtDomophone>) {
        await api.PUT(`houses/domophone/${domophone.domophoneId}`, domophonePayload(domophone, {
            ...overrides,
        }));
        await Promise.all([loadDevices(), refreshFlat()]);
    }

    async function toggleAlwaysOpen(domophone: RbtDomophone) {
        await updateDomophone(domophone, {
            locksAreOpen: domophone.locksAreOpen ? 0 : 1,
        });
    }

    async function toggleDomophoneEnabled(domophone: RbtDomophone) {
        await updateDomophone(domophone, {
            enabled: domophone.enabled ? 0 : 1,
        });
    }

    async function toggleDomophoneMonitoring(domophone: RbtDomophone) {
        await updateDomophone(domophone, {
            monitoring: domophone.monitoring ? 0 : 1,
        });
    }

    async function autoconfigureDomophone(domophoneId: number) {
        await api.POST(`houses/autoconfigure/${domophoneId}`, {
            object: 'domophone',
            firstTime: 0,
        });
    }

    async function getCameraSnapshot(cameraId: number): Promise<string> {
        const response = await api.GET(`cameras/camshot/${cameraId}`, { _refresh: '1' });
        return response?.shot || '';
    }

    async function saveKey(value: KeyFormValue) {
        if (!flatData.value)
            return;
        const rfId = normalizeRfid(value.rfId);
        if (!/^[0-9A-F]{14}$/.test(rfId))
            throw new Error('invalidKey');
        await api.POST('subscribers/key', {
            rfId,
            accessType: 2,
            accessTo: flatData.value.flatId,
            comments: value.comments.trim(),
        });
        await refreshFlat();
    }

    async function removeKey(keyId: number) {
        await api.DELETE(`subscribers/key/${keyId}`);
        await refreshFlat();
    }

    async function saveSubscriber(value: SubscriberFormValue, subscriber?: RbtSubscriber | null) {
        if (!flatData.value)
            return;

        const payload = {
            mobile: value.mobile.trim(),
            subscriberLast: value.subscriberLast.trim(),
            subscriberName: value.subscriberName.trim(),
            subscriberPatronymic: value.subscriberPatronymic.trim(),
            forceNames: true,
        };
        if (!payload.mobile)
            throw new Error('mobileRequired');

        if (subscriber) {
            await api.PUT(`subscribers/subscriber/${subscriber.subscriberId}`, {
                ...payload,
                flats: buildSubscriberFlatsPatch(subscriber, flatData.value.flatId, value.role),
            });
        } else {
            const response = await api.POST('subscribers/subscriber', {
                ...payload,
                flatId: flatData.value.flatId,
            });
            if (value.role === 'owner' && response?.subscriber) {
                await api.PUT(`subscribers/subscriber/${response.subscriber}`, {
                    flats: buildSubscriberFlatsPatch(null, flatData.value.flatId, value.role),
                });
            }
        }
        await refreshFlat();
    }

    async function removeSubscriber(subscriberId: number) {
        if (!flatData.value)
            return;
        await api.DELETE(`subscribers/subscriber/${flatData.value.flatId}`, { subscriberId });
        await refreshFlat();
    }

    function clearFlat() {
        flatRequest += 1;
        flatLoading.value = false;
        flatData.value = null;
        flatSubscribers.value = [];
        flatKeys.value = [];
        flatDevices.value = [];
        flatDomophones.value = [];
    }

    function clearHouse() {
        houseRequest += 1;
        selectedHouse.value = null;
        houseData.value = null;
        houseLoading.value = false;
        clearFlat();
    }

    return {
        cameras,
        domophones,
        devices,
        devicesLoading,
        houseQuery,
        houseResults,
        houseLoading,
        selectedHouse,
        houseData,
        flatLoading,
        flatData,
        flatSubscribers,
        flatKeys,
        flatDevices,
        flatDomophones,
        loadDevices,
        searchHouses,
        selectHouse,
        loadHouse,
        loadFlat,
        refreshFlat,
        toggleAdminBlock,
        generateOpenCode,
        disableOpenCode,
        openDoor,
        toggleAlwaysOpen,
        toggleDomophoneEnabled,
        toggleDomophoneMonitoring,
        autoconfigureDomophone,
        getCameraSnapshot,
        saveKey,
        removeKey,
        saveSubscriber,
        removeSubscriber,
        clearFlat,
        clearHouse,
    };
});
