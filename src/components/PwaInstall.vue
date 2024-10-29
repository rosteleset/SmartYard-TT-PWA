<script setup lang="ts">
import useSettingsStore from '@/stores/settingsStore';
import { IonButton, isPlatform } from '@ionic/vue';
import { computed } from 'vue';

const settings = useSettingsStore()

const isIos = isPlatform('ios')

const isRunningAsPWA = computed<boolean>(() => {
    return (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches
})

</script>

<template>
    <IonButton v-if="!isRunningAsPWA && settings.installPromptEvent" @click="settings.installPWA" expand="block">
        {{ $t('install') }}
    </IonButton>
    <p v-if="!isRunningAsPWA && isIos" class="ios-install-instructions">
        Чтобы установить приложение на iOS, откройте меню «Поделиться» в Safari и выберите «Добавить на экран «Домой»».
    </p>
</template>