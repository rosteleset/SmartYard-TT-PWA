<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { IonButton, IonCheckbox, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonPage, IonProgressBar, IonText, IonTitle, IonToolbar } from '@ionic/vue';

const authStore = useAuthStore();

const login = ref('');
const password = ref('');
const rememberMe = ref(false);

const handleLogin = () => {
  authStore.login(login.value, password.value);
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
        <IonTitle>Login</IonTitle>
        <IonProgressBar v-if="loading" type="indeterminate"></IonProgressBar>
      </IonToolbar>
    </IonHeader>

    <IonContent class="ion-padding">
      <IonItem>
        <IonInput label="Login" label-placement="floating" v-model="login"></IonInput>
      </IonItem>

      <IonItem>
        <IonInput label="Password" label-placement="floating" type="password" v-model="password"></IonInput>
      </IonItem>

      <IonItem>
        <IonCheckbox IonCheckbox v-model="rememberMe" class="ion-padding-vertical">
          remember me
        </IonCheckbox>
      </IonItem>

      <IonButton expand="block" @click="handleLogin" :disabled="loading">
        Login
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