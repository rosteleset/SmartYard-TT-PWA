<script setup lang="ts">
import {
  modalController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonImg,
  IonItem,
  IonTextarea,
  IonCheckbox, alertController
} from "@ionic/vue";
import {ref} from "vue";
import {useTtStore} from "@/stores/ttStore";
import {useAttachments, UserPhoto} from "@/hooks/useAttachments";
import {CameraSource, Photo} from "@capacitor/camera";

const tt = useTtStore()
const {takePhoto} = useAttachments()
const photo = ref<UserPhoto>();

const cancel = () => modalController.dismiss(null, 'cancel');

const confirm = () => {
  if (photo.value)

    tt.addAttachment(photo.value.data)
        .then(() =>
            modalController.dismiss(null, 'confirm')
        )
        .catch(error => {
          if (error.message === 'Failed to fetch')
            alertController.create({
              header: 'Нет сети',
              message: 'Фото будет загружено при подключении к сети',
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

const handlerCamera = () => {
  takePhoto(tt.project?.maxFileSize, CameraSource.Camera)
      .then(res => photo.value = res)
}
const handlerGallery = () => {
  takePhoto(tt.project?.maxFileSize, CameraSource.Photos)
      .then(res => photo.value = res)
}

</script>

<template>
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonButton color="medium" @click="cancel">{{ $t('base.cancel') }}</IonButton>
      </IonButtons>
      <IonTitle>{{ $t('tt.saAddFile') }}</IonTitle>
      <IonButtons slot="end">
        <IonButton @click="confirm" :strong="true">{{ $t('base.confirm') }}</IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent class="ion-padding">
    <IonImg :src="photo?.webPath"/>
    <IonButton expand="block" @click="handlerCamera">{{ $t('tt.camera') }}</IonButton>
    <IonButton expand="block" @click="handlerGallery">{{ $t('tt.gallery') }}</IonButton>

  </IonContent>
</template>

<style scoped>

</style>