<script setup lang="ts">
import {
    IonItem,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonFab,
    IonFabButton,
    IonIcon,
    IonList,
    IonButton,
    modalController
} from "@ionic/vue";
import dayjs from "dayjs";
import { add, eye, eyeOff } from "ionicons/icons";
import IssueAddComment from "@/components/IssueAddComment.vue";
import { useTtStore } from "@/stores/ttStore";
import { useAuthStore } from "@/stores/authStore";
import issueEditComment from "@/components/IssueEditComment.vue";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const { issue } = defineProps<{
    issue: IssueData
}>()

const tt = useTtStore()
const { user } = useAuthStore()

const getEditable = (comment: Comment) => {
    if (!tt.meta)
        return false;
    if (tt.meta.myRoles[issue.issue.project] < 20)
        return false;
    if (tt.meta.statuses.find(s => s.status === issue.issue.status)?.final === 1)
        return false;
    return tt.meta.myRoles[issue.issue.project] >= 70 || comment.author === user?.login;
}

const openModal = async (comment?: Comment, index?: number) => {
    const options = comment ? {
        component: issueEditComment,
        componentProps: { comment, index }
    } : { component: IssueAddComment, }

    const modal = await modalController.create(options);

    await modal.present();
};

</script>

<template>

    <IonCard v-for="(comment, index) of issue.issue.comments" :key="index">
        <IonCardHeader>
            <IonCardTitle>
                {{ comment.author }} {{ $t('tt.commented') }} [#{{ (Number(index) + 1) }}]
                {{ dayjs.unix(comment.created).format('DD.MM.YYYY HH:mm') }}
                <IonIcon :icon="comment.private ? eyeOff : eye"></IonIcon>
            </IonCardTitle>
        </IonCardHeader>
        <IonCardContent class="comment-body">
            {{ comment.body }}
        </IonCardContent>
        <IonButton v-if="getEditable(comment)" fill="clear" @click="openModal(comment, index)">
            {{ $t('base.edit') }}
        </IonButton>
    </IonCard>
    <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton @click="openModal()">
            <IonIcon :icon="add"></IonIcon>
        </IonFabButton>
    </IonFab>
</template>

<style scoped>
.comment-body {
    white-space: break-spaces;
    font-size: 150%;
}
</style>