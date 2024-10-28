<script setup lang="ts">
import useSettingsStore from '@/stores/settingsStore';
import { IonButton, isPlatform } from '@ionic/vue';

const settings = useSettingsStore()

const isIos = isPlatform('ios')

</script>

<template>
    <IonButton v-if="settings.installPromptEvent" @click="settings.installPWA" expand="block">
        {{ $t('install') }}
    </IonButton>
    <p v-if="isIos" class="ios-install-instructions">
        Чтобы установить приложение на iOS, откройте меню «Поделиться» в Safari и выберите «Добавить на экран «Домой»».
    </p>
</template>