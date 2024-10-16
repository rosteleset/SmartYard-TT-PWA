<script setup lang="ts">
import IssueAddFile from "@/components/IssueAddFile.vue";
import { useAuthStore } from "@/stores/authStore";
import { useTtStore } from "@/stores/ttStore";
import api from "@/utils/api";
import {
  alertController,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonFab,
  IonFabButton,
  IonIcon,
  modalController
} from "@ionic/vue";
import dayjs from "dayjs";
import { add } from "ionicons/icons";
import { useI18n } from "vue-i18n";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const { issue } = defineProps<{
  issue: IssueData
}>()

const { user, token } = useAuthStore()
const tt = useTtStore()
const { t } = useI18n()

const getEditable = (attachment: Attachment) => {
  if (!tt.meta)
    return false;
  if (tt.meta.myRoles[issue.issue.project] < 20)
    return false;
  if (tt.meta.statuses.find(s => s.status === issue.issue.status)?.final === 1)
    return false;
  return tt.meta.myRoles[issue.issue.project] >= 70 || attachment.metadata.attachman === user?.login;
}

const openModal = async () => {
  const modal = await modalController.create({
    component: IssueAddFile,
  });

  await modal.present();

  const { role } = await modal.onWillDismiss();

  if (role === 'confirm')
    await tt.updateIssue();
};

const deleteHandler = async (attachment: Attachment) => {

  const alert = await alertController.create({
    header: t('confirmation'),
    message: `${t('deleteFile')} "${attachment.filename}"?`,
    buttons: [{
      text: t('delete'),
      handler: async () => {
        api.DELETE('tt/file', {
          issueId: issue.issue.issueId,
          filename: attachment.filename,
        })
          .then(() => tt.updateIssue())
      }
    }],
  });

  await alert.present();

}

</script>

<template>
  <IonCard v-for="img of issue.issue.attachments" :key="img.id">
    <img :alt="img.filename"
      :src="`${SERVER_URL}/tt/file?issueId=${issue.issue.issueId}&filename=${img.filename}&_token=${token}`" />
    <IonCardHeader>
      <IonCardTitle>{{ dayjs.unix(img.metadata.date).format('DD.MM.YYYY HH:mm') }} - {{
        img.metadata.attachman
        }}
      </IonCardTitle>
      <IonCardSubtitle>{{ img.filename }}</IonCardSubtitle>

    </IonCardHeader>
    <IonButton v-if="getEditable(img)" fill="clear" color="danger" @click="deleteHandler(img)">
      {{ $t('delete') }}
    </IonButton>
  </IonCard>
  <IonFab slot="fixed" vertical="bottom" horizontal="end">
    <IonFabButton @click="openModal">
      <IonIcon :icon="add"></IonIcon>
    </IonFabButton>
  </IonFab>
</template>

<style scoped></style>