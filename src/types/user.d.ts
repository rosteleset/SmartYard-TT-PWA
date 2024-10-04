interface User {
    defaultRoute: string;
    eMail: string | null;
    enabled: number;
    groups: string[];
    login: string;
    notification: string;
    phone: string;
    primaryGroup: number;
    primaryGroupAcronym: string | null;
    realName: string;
    settings: any[]; 
    tg: string;
    twoFA: number;
    uid: number;
    webRtcExtension: string;
    webRtcPassword: string;
}
