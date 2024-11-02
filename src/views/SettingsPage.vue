<script setup lang="ts">
import PageHeader from "@/components/PageHeader.vue";
import { IonContent, IonPage } from "@ionic/vue";
import { defineAsyncComponent } from "vue";

const SettingsAccount = defineAsyncComponent(() => import('@/components/SettingsAccount.vue'));
const SettingsApp = defineAsyncComponent(() => import('@/components/SettingsApp.vue'));

</script>

<template>
  <IonPage>
    <PageHeader :label="$t('settings-page')" />
    <IonContent scrollEvents class="ion-padding">
      <SettingsAccount />
      <SettingsApp />
    </IonContent>
  </IonPage>
</template>

<style scoped></style>