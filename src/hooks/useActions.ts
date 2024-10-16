import IssueAction from "@/components/IssueAction.vue";
import IssueAddComment from "@/components/IssueAddComment.vue";
import IssueAddFile from "@/components/IssueAddFile.vue";
import useModal from "@/hooks/useModal";
import { useTtStore } from "@/stores/ttStore";
import api from "@/utils/api";
import { ActionSheetButton, alertController } from "@ionic/vue";
import { useI18n } from "vue-i18n";
import useAlert from "./useAlert";
import { useAuthStore } from "@/stores/authStore";

const specialActions = [
    "saAddComment",
    "saAddFile",
    "saAddSingleFile",
    "saAddSingleFileQuiet",
    "saAssignToMe",
    "saWatch",
    "saDelete",
    "saSubIssue",
    "saCoordinate",
    "saLink",
]

export const useActions = () => {

    const { t } = useI18n()
    const tt = useTtStore()
    const auth = useAuthStore()
    const { presentAlert } = useAlert()
    const { openModal } = useModal()

    const getActionLabel = (action: string) => {
        let text: string;
        if (action.at(0) === '!')
            text = action.slice(1);
        else
            text = action

        if (specialActions.includes(text))
            return t(text);
        else
            return text
    }

    const getButtons = (issue: IssueData): ActionSheetButton[] => {
        return Object.values(issue.actions || {}).map(i => {
            if (i === "-") {
                // Создаем объект разделителя
                return { role: 'separator', disabled: true };
            }
            return {
                text: getActionLabel(i),
                handler: () => initAction(i),
            };
        })
    }

    const initAction = (_name: string, issue?: string | string[], fields?: string[]) => {
        let name = _name
        if (name.at(0) === '!')
            name = name.slice(1)

        switch (name) {
            case "saAddComment":
                openModal(IssueAddComment, { issue }).then(() => null)
                break;
            case "saAddFile":
            case "saAddSingleFile":
                openModal(IssueAddFile).then(() => null)
                break;
            case "saAssignToMe":
                presentAlert({
                    header: t('confirmation'),
                    message: t('saAssignToMe'),
                    buttons: [{
                        text: t("confirmAssignToMe"),
                        handler: () => api.PUT(`tt/issue/${issue || tt.issue?.issue.issueId}`, { action: 'assignToMe' })
                            .then(tt.updateIssue)
                            .catch(e => presentAlert({
                                header: t('something-went-wrong'),
                                message: e.message
                            }))
                    }]
                })
                break;
            case "saWatch":
                presentAlert({
                    header: t('confirmation'),
                    message: tt.issue && auth.user && Object.values(tt.issue.issue.watchers).includes(auth.user.login) ? t('confirmUnWatch') : t('confirmWatch'),
                    buttons: [{
                        text: t('saWatch'),
                        handler: () => api.PUT(`tt/issue/${issue || tt.issue?.issue.issueId}`, { action: 'watch' })
                            .then(tt.updateIssue)
                            .catch(e => presentAlert({
                                header: t('something-went-wrong'),
                                message: e.message
                            }))
                    }]
                })
                tt.doAction({ action: 'watch' })
                break;
            case "saDelete":
                if (Array.isArray(issue))
                    for (const i of issue) {
                        tt.deleteIssue(i)
                    }
                else
                    tt.deleteIssue(issue)
                break;
            case "saSubIssue":
            case "saCoordinate":
            case "saLink":
                break;

            default:
                const multiplay = Array.isArray(issue)

                api.GET('tt/action', {
                    _id: multiplay ? issue[0] : issue || tt.issue?.issue.issueId,
                    action: name
                })
                    .then(res => {
                        const withoutAccept = res.template === "!"
                        if (withoutAccept)
                            if (multiplay)
                                Promise.all(issue.map(i => tt.doAction({ action: name, issueId: i })))
                            else
                                tt.doAction({ action: name, issueId: issue })
                        else {
                            if (typeof res.template === 'string')
                                fields = [res.template];
                            else
                                fields = Object.values(res.template);
                        }


                        if (!withoutAccept)
                            openModal(IssueAction, { name, issue, _fields: fields }).then(() => null)

                    })
                    .catch((error) => {
                        presentAlert({
                            header: t('something-went-wrong'),
                            message: error.message,
                            buttons: [t('ok')],
                        })
                    })
        }

    }

    return {
        getActionLabel,
        getButtons,
        initAction
    }
}