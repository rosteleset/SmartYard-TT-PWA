import type {
    FlatEntranceModel,
    RbtDeviceListItem,
    RbtDomophone,
    RbtFlat,
    RbtHouse,
    RbtStatus,
    RbtSubscriber,
    RbtSubscriberDevice,
} from '@/types/operations';

export type StatusColor = 'success' | 'warning' | 'danger' | 'medium';

export function statusColor(status?: RbtStatus): StatusColor {
    const value = String(status?.status || 'unknown').toLowerCase();
    if (value === 'ok')
        return 'success';
    if (value === 'unknown')
        return 'medium';
    if (value.includes('sip') || value.includes('other') || value.includes('dvr'))
        return 'warning';
    return 'danger';
}

export function isUnavailable(item: RbtDeviceListItem): boolean {
    return String(item.status?.status || 'unknown').toLowerCase() !== 'ok';
}

export function formatDateTime(value?: number): string {
    if (!value)
        return '—';
    const date = new Date(value * 1000);
    if (Number.isNaN(date.getTime()))
        return '—';
    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function formatSubscriberName(subscriber: RbtSubscriber): string {
    const name = [
        subscriber.subscriberLast,
        subscriber.subscriberName,
        subscriber.subscriberPatronymic,
    ].filter(Boolean).join(' ');
    return name || subscriber.mobile || String(subscriber.subscriberId);
}

export function subscriberRole(subscriber: RbtSubscriber, flatId: number): 'owner' | 'resident' {
    const relation = subscriber.flats?.find(flat => Number(flat.flatId) === Number(flatId));
    return relation && Number(relation.role) === 0 ? 'owner' : 'resident';
}

export function buildSubscriberFlatsPatch(
    subscriber: RbtSubscriber | null,
    flatId: number,
    role: 'owner' | 'resident',
): Record<string, { role: number }> {
    const patch: Record<string, { role: number }> = {};

    subscriber?.flats?.forEach(flat => {
        patch[String(flat.flatId)] = { role: Number(flat.role) === 0 ? 1 : 0 };
    });
    patch[String(flatId)] = { role: role === 'owner' ? 1 : 0 };

    return patch;
}

export function latestSubscriberDevice(
    devices: RbtSubscriberDevice[],
    subscriberId: number,
): RbtSubscriberDevice | undefined {
    return devices
        .filter(device => Number(device.subscriberId) === Number(subscriberId))
        .sort((left, right) => Number(right.lastSeen || right.registered || 0) - Number(left.lastSeen || left.registered || 0))[0];
}

export function formatDevice(device?: RbtSubscriberDevice): string {
    if (!device)
        return '—';
    const platform = ({ 1: 'Android', 2: 'iOS', 3: 'Web' } as Record<number, string>)[Number(device.platform)] || '—';
    return [platform, device.version ? `v${device.version}` : '', formatDateTime(device.lastSeen || device.registered)]
        .filter(value => value && value !== '—')
        .join(' · ');
}

export function normalizeRfid(value: string): string {
    const normalized = value.toUpperCase().replace(/[\s:-]+/g, '');
    return /^[0-9A-F]+$/.test(normalized) && normalized.length <= 14
        ? normalized.padStart(14, '0')
        : normalized;
}

export function domophonePayload(domophone: RbtDomophone, overrides: Partial<RbtDomophone>) {
    return {
        enabled: Number(domophone.enabled || 0),
        model: domophone.model || '',
        server: domophone.server || '',
        url: domophone.url || '',
        credentials: domophone.credentials || '',
        dtmf: domophone.dtmf || '#',
        firstTime: Number(domophone.firstTime || 0),
        nat: Number(domophone.nat || 0),
        locksAreOpen: Number(domophone.locksAreOpen || 0),
        comments: domophone.comments || '',
        name: domophone.name || '',
        display: domophone.display || '',
        video: domophone.video || '',
        monitoring: Number(domophone.monitoring || 0),
        ext: domophone.ext || {},
        concierge: domophone.concierge || '',
        sos: domophone.sos || '',
        tree: domophone.tree || '',
        ...overrides,
    };
}

export function flatEntranceModels(
    flat: RbtFlat,
    house: RbtHouse | null,
    domophones: RbtDomophone[],
): FlatEntranceModel[] {
    const detailedEntrances = new Map((house?.entrances || []).map(item => [Number(item.entranceId), item]));
    const domophoneMap = new Map(domophones.map(item => [Number(item.domophoneId), item]));

    return (flat.entrances || []).map(item => {
        const entrance = detailedEntrances.get(Number(item.entranceId));
        const domophone = domophoneMap.get(Number(item.domophoneId)) || { domophoneId: Number(item.domophoneId) };
        return {
            entranceId: Number(item.entranceId),
            entranceName: entrance?.entrance || `#${item.entranceId}`,
            doorId: Number(entrance?.domophoneOutput || 0),
            domophoneId: Number(item.domophoneId),
            domophone,
            status: domophone.status,
        };
    });
}
