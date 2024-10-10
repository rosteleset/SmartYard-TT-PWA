<script setup lang="ts">

import {IonCard, IonCardTitle, IonSelect, IonSelectOption} from "@ionic/vue";
import useSettingsStore from "@/stores/settingsStore";
import {useI18n} from "vue-i18n";

const i18n = useI18n()
const settings = useSettingsStore()
</script>

<template>
  <IonCard class="ion-padding grid">
    <IonCardTitle>{{ $t('settings.app') }}</IonCardTitle>

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