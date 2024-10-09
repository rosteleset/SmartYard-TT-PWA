import IssueAction from "@/components/IssueAction.vue";
import IssueAddComment from "@/components/IssueAddComment.vue";
import IssueAddFile from "@/components/IssueAddFile.vue";
import useModal from "@/hooks/useModal";
import { useTtStore } from "@/stores/ttStore";
import { ActionSheetButton, alertController } from "@ionic/vue";
import { useI18n } from "vue-i18n";

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
        const withoutAccept = name.at(0) === '!'
        if (withoutAccept)
            name = name.slice(1)
        if (specialActions.includes(name))
            switch (name) {
                case "saAddComment":
                    openModal(IssueAddComment, { issue }).then(() => null)
                    break;
                case "saAddFile":
                case "ttSaAddSingleFile":
                    openModal(IssueAddFile).then(() => null)
                    break;
                default:
                    console.log(name)
            }
        else if (withoutAccept)
            tt.doAction({ action: name })
                .catch((error) => {
                    alertController.create({
                        header: 'Что то пошло не так',
                        message: error.message,
                        buttons: ['Ok'],
                    })
                        .then((alert) => alert.present())
                })
        else
            openModal(IssueAction, { name, issue, _fields: fields }).then(() => null)
    }

    return {
        getActionLabel,
        getButtons,
        initAction
    }
}