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
    <template v-if="!isRunningAsPWA">
        <IonButton v-if="settings.installPromptEvent" @click="settings.installPWA" expand="block">
            {{ $t('install') }}
        </IonButton>
        <p v-if="isIos" class="ios-install-instructions">
            {{ $t('install-instructions') }}
        </p>
    </template>
</template>