<script setup lang="ts">
import IssueAddComment from "@/components/IssueAddComment.vue";
import issueEditComment from "@/components/IssueEditComment.vue";
import { useAuthStore } from "@/stores/authStore";
import { useTtStore } from "@/stores/ttStore";
import convertLinks from "@/utils/convertLinks";
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonFab,
    IonFabButton,
    IonIcon,
    modalController
} from "@ionic/vue";
import dayjs from "dayjs";
import { add, eye, eyeOff } from "ionicons/icons";

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
                {{ comment.author }} {{ $t('commented') }} [#{{ (Number(index) + 1) }}]
                {{ dayjs.unix(comment.created).format('DD.MM.YYYY HH:mm') }}
                <IonIcon :icon="comment.private ? eyeOff : eye"></IonIcon>
            </IonCardTitle>
        </IonCardHeader>
        <IonCardContent class="comment-body" v-html="convertLinks(comment.body)">
        </IonCardContent>
        <IonButton v-if="getEditable(comment)" fill="clear" @click="openModal(comment, index)">
            {{ $t('edit') }}
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