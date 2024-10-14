<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { IonButton, IonCheckbox, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonPage, IonProgressBar, IonText, IonTitle, IonToolbar } from '@ionic/vue';

const authStore = useAuthStore();

const login = ref('');
const password = ref('');
const rememberMe = ref(false);

const handleLogin = () => {
  authStore.login(login.value, password.value, rememberMe.value);
};

const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

// Инициализация токена при монтировании компонента
onMounted(() => {
  authStore.initialize();
});
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>{{ $t('login') }}</IonTitle>
        <IonProgressBar v-if="loading" type="indeterminate"></IonProgressBar>
      </IonToolbar>
    </IonHeader>

    <IonContent class="ion-padding">
      <IonItem>
        <IonInput :label="$t('login')" label-placement="floating" autocomplete="username" v-model="login"></IonInput>
      </IonItem>

      <IonItem>
        <IonInput :label="$t('password')" label-placement="floating" type="password" v-model="password"></IonInput>
      </IonItem>

      <IonItem>
        <IonCheckbox IonCheckbox v-model="rememberMe" class="ion-padding-vertical">
          {{ $t('remember-me') }}
        </IonCheckbox>
      </IonItem>

      <IonButton expand="block" @click="handleLogin" :disabled="loading">
        {{ $t('loginAction') }}
      </IonButton>

      <IonText color="danger" v-if="error">{{ error }}</IonText>
    </IonContent>
  </IonPage>
</template>

<style scoped>
ion-text {
  display: block;
  margin-top: 10px;
  text-align: center;
}
</style>