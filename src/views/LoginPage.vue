<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import { IonButton, IonCheckbox, IonContent, IonHeader, IonInput, IonItem, IonPage, IonProgressBar, IonText, IonTitle, IonToolbar, useIonRouter } from '@ionic/vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useIonRouter();

const login = ref('');
const password = ref('');
const rememberMe = ref(false);

const handleLogin = () => {
  authStore.login(login.value.trim(), password.value.trim(), rememberMe.value);
};

const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

onMounted(()=>{
  if (authStore.user !== null)
   router.replace('/')
})
</script>

<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>{{ $t('login') }}</IonTitle>
        <IonProgressBar v-if="loading" type="indeterminate"></IonProgressBar>
      </IonToolbar>
    </IonHeader>

    <IonContent v-if="!authStore.token && !authStore.loading" class="ion-padding">
      <form @submit.prevent="handleLogin">
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

        <IonButton expand="block" type="submit" :disabled="loading">
          {{ $t('loginAction') }}
        </IonButton>

        <IonText color="danger" v-if="error">{{ $t(`errors.${error}`) }}</IonText>
      </form>
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