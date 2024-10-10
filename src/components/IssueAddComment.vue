<script setup lang="ts">
import {
  modalController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonItem,
  IonTextarea,
  IonCheckbox, alertController
} from "@ionic/vue";
import { ref } from "vue";
import { useTtStore } from "@/stores/ttStore";
import { useI18n } from "vue-i18n";

const { issue } = defineProps<{
  issue?: string | string[]
}>()

const tt = useTtStore()
const { t } = useI18n()
const comment = ref<string>("");
const commentPrivate = ref(true);

const cancel = () => modalController.dismiss(null, 'cancel');
const confirm = () => {

  if (Array.isArray(issue))
    Promise.all(issue.map(id =>
      tt.addComment(comment.value, commentPrivate.value, id)
    ))
      .then(() =>
        modalController.dismiss(null, 'confirm')
      )
      .catch(error => {
        if (error.message === 'Failed to fetch')
          alertController.create({
            header: t('no-network'),
            message: t('comments-will-be-loaded-when-connected-to-the-network'),
            buttons: [t('ok')],
          })
            .then((alert) => alert.present())
            .then(() => modalController.dismiss(null, 'confirm'))
        else {
          alertController.create({
            header: t('something-went-wrong'),
            message: error.message,
            buttons: [t('ok')],
          })
            .then((alert) => alert.present())
        }
      })

  else
    tt.addComment(comment.value, commentPrivate.value, issue)
      .then(() =>
        modalController.dismiss(null, 'confirm')
      )
      .catch(error => {
        if (error.message === 'Failed to fetch')
          alertController.create({
            header: t('no-network'),
            message: t('the-comment-will-be-downloaded-when-connected-to-the-network'),
            buttons: [t('ok')],
          })
            .then((alert) => alert.present())
            .then(() => modalController.dismiss(null, 'confirm'))
        else {
          alertController.create({
            header: t('something-went-wrong'),
            message: error.message,
            buttons: [t('ok')],
          })
            .then((alert) => alert.present())
        }
      })
}
</script>

<template>
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonButton color="medium" @click="cancel">{{ $t('cancel') }}</IonButton>
      </IonButtons>
      <IonTitle>{{ $t('saAddComment') }}</IonTitle>
      <IonButtons slot="end">
        <IonButton @click="confirm" :strong="true">{{ $t('confirm') }}</IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent class="ion-padding">
    <IonItem>
      <IonTextarea :auto-grow="true" label-placement="floating" :label="$t('comment')" :placeholder="$t('type-something-here')"
        v-model="comment" />
    </IonItem>
    <IonItem>
      <IonCheckbox id="terms" v-model="commentPrivate">
        <div class="ion-text-wrap">{{ $t('commentPrivate') }}</div>
      </IonCheckbox>
    </IonItem>
  </IonContent>
</template>

<style scoped></style>