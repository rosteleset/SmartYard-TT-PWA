<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>{{ t('notFound.title') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent class="ion-padding">
      <div class="not-found-container">
        <IonIcon name="alert-circle-outline" size="large"></IonIcon>
        <h2>{{ t('notFound.error') }}</h2>
        <p>{{ t('notFound.message') }}</p>
        <IonButton expand="block" @click="goHome">{{ t('notFound.buttonText') }}</IonButton>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

function goHome(): void {
  router.push('/');
}
</script>

<style scoped>
.not-found-container {
  text-align: center;
  margin-top: 50px;
}

.not-found-container ion-icon {
  font-size: 64px;
  color: var(--ion-color-primary);
  margin-bottom: 20px;
}
</style>
