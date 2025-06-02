interface User {
    defaultRoute: string;
    eMail: string | null;
    enabled: number;
    groups: Group[];
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

interface Group {
    gid: number;
    name: string;
    acronym: string;
    users: number;
    admin: number;
    adminLogin: string;
  }