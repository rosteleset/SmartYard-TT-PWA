interface Meta {
    projects: Project[];
    workflows: Workflows;
    workflowLibs: string[];
    filters: Filters;
    filtersExt: FiltersExt;
    statuses: Status[];
    resolutions: Resolution[];
    customFields: CustomField[];
    roles: Role[];
    tags: any[];
    viewers: Viewer[];
    crontabs: Crontab[];
    myRoles: Record<string, number>;
    myGroups: any[];
    prints: Print[];
    favoriteFilters: any[];
}

interface Project {
    projectId: number;
    acronym: string;
    project: string;
    maxFileSize: number;
    searchSubject: number;
    searchDescription: number;
    searchComments: number;
    assigned: number;
    workflows: string[];
    filters: ProjectFilter[];
    resolutions: number[];
    customFields: number[];
    users: User[];
    groups: any[];
    viewers: any[];
    tags: any[];
}

interface ProjectFilter {
    projectFilterId: number;
    filter: string;
    personal: number;
}

interface User {
    projectRoleId: number;
    uid: number;
    roleId: number;
    level: number;
    login: string;
    byGroup: boolean;
}

interface Workflows {
    [key: string]: Workflow;
}

interface Workflow {
    name: string;
    catalog: Catalog;
}

interface Catalog {
    [key: string]: Record<string, string>;
}

interface Filters {
    [key: string]: string;
}

interface FiltersExt {
    [key: string]: FilterExt;
}

interface FilterExt {
    name: string;
    shortName: string | null;
    sort: string | null;
    hide: string | null;
    disableCustomSort: boolean;
    pipeline: boolean;
    owner: string | null;
}

interface Status {
    statusId: number;
    status: string;
    final: number;
}

interface Resolution {
    resolutionId: number;
    resolution: string;
}

interface CustomField {
    customFieldId: number;
    catalog: string;
    type: string;
    field: string;
    fieldDisplay: string;
    fieldDescription: string | null;
    regex: string | null;
    link: string | null;
    format: string | null;
    editor: string;
    indx: string | null;
    search: string | null;
    required: string | null;
    options: any[];
}

interface Role {
    roleId: number;
    name: string;
    nameDisplay: string | null;
    level: number;
}

interface Viewer {
    filename: string;
    name: string;
    field: string;
    code: string;
}

interface Crontab {
    crontabId: number;
    crontab: string;
    projectId: number;
    filter: string;
    uid: number;
    action: string;
}

interface Print {
    printId: number;
    formName: string;
    extension: string;
    description: string;
    hasTemplate: boolean;
}

interface Comment {
    created: number;
    type: boolean;
    private: boolean;
    author: string;
    body: string;
}

interface Metadata {
    type: string;
    attachman: string;
    project: string;
    date: number;
    issue: boolean;
    added: number;
    issueId: string;
}

interface UploadDate {
    $date: {
        $numberLong: string;
    };
}

interface Attachment {
    metadata: Metadata;
    filename: string;
    chunkSize: number;
    id: string;
    length: number;
    md5: string;
    uploadDate: UploadDate;
}

interface Issue {
    subject: string;
    status: string;
    workflow: string;
    issueId: string;
    id: string;
}

interface DetailIssue extends Issue {
    created: number;
    assigned: string[];
    description: string;
    tags: string[];
    author: string;
    attachments: Attachment[];
    comments: Record<number, Comment>
    updated: number;
    catalog: string;
    project: string;
    childrens: DataStructure;
    watchers: string[];

    [key: string]: any;
}

interface IssueData {
    fields: Record<number, string>;
    issue: DetailIssue;
    actions: Record<number, string>;
    showJournal: boolean;
}

interface DataStructure {
    issues: Issue[];
    projection: Record<string, number>;
    sort: Record<string, number>;
    skip: string;
    limit: string;
    count: number;
    all: string[];
}