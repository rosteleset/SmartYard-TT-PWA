<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore";
import api from "@/utils/api";
import { IonButton, IonCard, IonCardTitle, IonInput } from "@ionic/vue";
import { onMounted, ref } from "vue";

interface User {
  enabled: number
  login: string
  notification: string
  phone: string
  realName: string
  uid: number
}

const authStore = useAuthStore()
const user = ref<User>()

onMounted(() => {
  api.GET('user/whoAmI')
    .then(res => {
      user.value = res.user
    })
})
</script>

<template>
  <IonCard class="ion-padding grid">
    <IonCardTitle>{{ $t('settings.account') }}</IonCardTitle>
    <IonInput :label="$t('settings.username')" label-placement="floating" :value="user?.login" readonly />
    <IonInput :label="$t('settings.realName')" label-placement="floating" :value="user?.realName" />

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