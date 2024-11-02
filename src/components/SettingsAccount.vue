<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore";
import { IonButton, IonCard, IonCardTitle, IonInput } from "@ionic/vue";

interface User {
  enabled: number
  login: string
  notification: string
  phone: string
  realName: string
  uid: number
}

const authStore = useAuthStore()

</script>

<template>
  <IonCard class="ion-padding grid">
    <IonCardTitle>{{ $t('settings.account') }}</IonCardTitle>
    <IonInput :label="$t('settings.username')" label-placement="floating" :value="authStore.user?.login" readonly />
    <IonInput :label="$t('settings.realName')" label-placement="floating" :value="authStore.user?.realName" />

    <IonButton size="default" expand="block" @click="authStore.logout">{{ $t('settings.logout') }}</IonButton>
  </IonCard>

</template>

<style scoped>
.grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>