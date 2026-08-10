export interface RbtStatus {
    status?: string;
    message?: string;
}

export interface RbtSesameDvrSettings {
    streamName?: string;
    displayName?: string;
    retentionDays?: string;
    autoManage?: boolean;
    lastSyncAt?: string;
    lastSyncError?: string | null;
    [key: string]: unknown;
}

export interface RbtCamera {
    cameraId: number;
    enabled?: number;
    name?: string;
    model?: string;
    ip?: string;
    url?: string;
    stream?: string;
    dvrStream?: string;
    timezone?: string;
    lat?: number | string;
    lon?: number | string;
    frs?: string;
    frsMode?: number;
    common?: number;
    comments?: string;
    sound?: number;
    monitoring?: number;
    webrtc?: number;
    tree?: string;
    ext?: {
        sesameDvr?: RbtSesameDvrSettings;
        [key: string]: unknown;
    };
    status?: RbtStatus;
    [key: string]: unknown;
}

export interface RbtDomophone {
    domophoneId: number;
    name?: string;
    model?: string;
    ip?: string;
    server?: string;
    url?: string;
    credentials?: string;
    dtmf?: string;
    firstTime?: number;
    nat?: number;
    locksAreOpen?: number;
    comments?: string;
    display?: string;
    video?: string;
    monitoring?: number;
    enabled?: number;
    ext?: Record<string, unknown>;
    concierge?: string;
    sos?: string;
    tree?: string;
    status?: RbtStatus;
    [key: string]: unknown;
}

export interface RbtDeviceListItem {
    id: number;
    key: string;
    type: 'camera' | 'domophone';
    title: string;
    subtitle: string;
    address: string;
    status?: RbtStatus;
    raw: RbtCamera | RbtDomophone;
}

export interface RbtHouseSummary {
    houseId: number;
    houseFull?: string;
    [key: string]: unknown;
}

export interface RbtEntrance {
    entranceId: number;
    entrance?: string;
    entranceType?: string;
    domophoneId?: number;
    domophoneOutput?: number;
    [key: string]: unknown;
}

export interface RbtFlatEntrance {
    entranceId: number;
    domophoneId: number;
    apartment?: string;
    apartmentLevels?: string;
    [key: string]: unknown;
}

export interface RbtFlat {
    flatId: number;
    flat?: string;
    floor?: number;
    houseId?: number;
    addressHouseId?: number;
    manualBlock?: number;
    adminBlock?: number;
    autoBlock?: number;
    openCode?: string;
    lastOpened?: number;
    sipEnabled?: number;
    subscribersLimit?: number;
    entrances?: RbtFlatEntrance[];
    [key: string]: unknown;
}

export interface RbtHouse {
    flats: RbtFlat[];
    entrances: RbtEntrance[];
    cameras: RbtCamera[];
    [key: string]: unknown;
}

export interface RbtSubscriberFlat {
    flatId: number;
    role: number;
    [key: string]: unknown;
}

export interface RbtSubscriber {
    subscriberId: number;
    mobile?: string;
    subscriberLast?: string;
    subscriberName?: string;
    subscriberPatronymic?: string;
    flats?: RbtSubscriberFlat[];
    [key: string]: unknown;
}

export interface RbtKey {
    keyId: number;
    rfId?: string;
    comments?: string;
    lastSeen?: number;
    [key: string]: unknown;
}

export interface RbtSubscriberDevice {
    deviceId: number;
    subscriberId?: number;
    platform?: number;
    version?: string;
    lastSeen?: number;
    registered?: number;
    flats?: Array<{ flatId: number }>;
    [key: string]: unknown;
}

export interface FlatEntranceModel {
    entranceId: number;
    entranceName: string;
    doorId: number;
    domophoneId: number;
    domophone: RbtDomophone;
    status?: RbtStatus;
}

export interface SubscriberFormValue {
    mobile: string;
    subscriberLast: string;
    subscriberName: string;
    subscriberPatronymic: string;
    role: 'owner' | 'resident';
}

export interface KeyFormValue {
    rfId: string;
    comments: string;
}
