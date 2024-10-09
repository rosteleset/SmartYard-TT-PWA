<script setup lang="ts">
import { useTtStore } from "@/stores/ttStore";
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonItem,
  IonTextarea,
  IonTitle,
  IonToolbar, modalController
} from "@ionic/vue";
import { ref } from "vue";

const { comment, index } = defineProps<{ comment: Comment, index: number }>()
const tt = useTtStore()

const commentBody = ref<string>(comment.body);
const commentPrivate = ref<boolean>(comment.private);

const cancel = () => modalController.dismiss(null, 'cancel');
const confirm = () => {
  tt.editComment(commentBody.value, commentPrivate.value, index)
    .then(() =>
      modalController.dismiss(null, 'confirm')
    )
}
</script>

<template>
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonButton color="medium" @click="cancel">{{ $t('cancel') }}</IonButton>
      </IonButtons>
      <IonTitle>{{ $t('modifyComment') }}</IonTitle>
      <IonButtons slot="end">
        <IonButton @click="confirm" :strong="true">{{ $t('confirm') }}</IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent class="ion-padding">
    <IonItem>
      <IonTextarea :auto-grow="true" label-placement="floating" :label="$t('comment')" placeholder="Type something here"
        v-model="commentBody" />
    </IonItem>
    <IonItem>
      <IonCheckbox id="terms" v-model="commentPrivate">
        <div class="ion-text-wrap">{{ $t('commentPrivate') }}</div>
      </IonCheckbox>
    </IonItem>
  </IonContent>
</template>

<style scoped></style>