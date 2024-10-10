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
import { useI18n } from "vue-i18n";

const tt = useTtStore()
const { t } = useI18n()
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
              header: t('no-network'),
              message: t('the-photo-will-be-downloaded-when-connected-to-the-network'),
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
        <IonButton color="medium" @click="cancel">{{ $t('cancel') }}</IonButton>
      </IonButtons>
      <IonTitle>{{ $t('saAddFile') }}</IonTitle>
      <IonButtons slot="end">
        <IonButton @click="confirm" :strong="true">{{ $t('confirm') }}</IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent class="ion-padding">
    <IonImg :src="photo?.webPath"/>
    <IonButton expand="block" @click="handlerCamera">{{ $t('camera') }}</IonButton>
    <IonButton expand="block" @click="handlerGallery">{{ $t('gallery') }}</IonButton>

  </IonContent>
</template>

<style scoped>

</style>