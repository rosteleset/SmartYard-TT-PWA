<script setup lang="ts">

import useSettingsStore from "@/stores/settingsStore";
import { IonCard, IonCardTitle, IonInput, IonSelect, IonSelectOption } from "@ionic/vue";
import { useI18n } from "vue-i18n";

declare const __APP_VERSION__: string;

const i18n = useI18n()
const settings = useSettingsStore()

const appVersion = __APP_VERSION__;
</script>

<template>
  <IonCard class="ion-padding grid">
    <IonCardTitle>{{ $t('settings.app') }}</IonCardTitle>

    <IonInput label="version" label-placement="floating" :value="appVersion"  readonly/>

    <IonSelect
        :label="$t('settings.locale')"
        label-placement="floating"
        interface="popover"
        :value="settings.locale"
        @ionChange="settings.changeLocale($event.target.value)"
    >
      <IonSelectOption v-for="locale in i18n.availableLocales" :key="locale">{{ locale }}</IonSelectOption>
    </IonSelect>

  </IonCard>
</template>

<style scoped>

</style>