<script setup lang="ts">
import PageHeader from "@/components/PageHeader.vue";
import SettingsAccount from "@/components/SettingsAccount.vue";
import SettingsApp from "@/components/SettingsApp.vue";
import { IonContent, IonPage } from "@ionic/vue";
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