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
import {ref} from "vue";
import {useTtStore} from "@/stores/ttStore";

const {issue} = defineProps<{
  issue?: string | string[]
}>()

const tt = useTtStore()

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
              header: 'Нет сети',
              message: 'Комментарии будет загружен при подключении к сети',
              buttons: ['Ok'],
            })
                .then((alert) => alert.present())
                .then(() => modalController.dismiss(null, 'confirm'))
          else {
            alertController.create({
              header: 'Что то пошло не так',
              message: error.message,
              buttons: ['Ok'],
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
              header: 'Нет сети',
              message: 'Комментарий будет загружен при подключении к сети',
              buttons: ['Ok'],
            })
                .then((alert) => alert.present())
                .then(() => modalController.dismiss(null, 'confirm'))
          else {
            alertController.create({
              header: 'Что то пошло не так',
              message: error.message,
              buttons: ['Ok'],
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
        <IonButton color="medium" @click="cancel">{{ $t('base.cancel') }}</IonButton>
      </IonButtons>
      <IonTitle>{{ $t('tt.saAddComment') }}</IonTitle>
      <IonButtons slot="end">
        <IonButton @click="confirm" :strong="true">{{ $t('base.confirm') }}</IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent class="ion-padding">
    <IonItem>
      <IonTextarea :auto-grow="true" label-placement="floating" :label="$t('tt.comment')" placeholder="Type something here"
                   v-model="comment"/>
    </IonItem>
    <IonItem>
      <IonCheckbox id="terms" v-model="commentPrivate">
        <div class="ion-text-wrap">{{ $t('tt.commentPrivate') }}</div>
      </IonCheckbox>
    </IonItem>
  </IonContent>
</template>

<style scoped>

</style>