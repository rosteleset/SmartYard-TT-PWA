import { i18n } from "@/i18n";
import { Preferences } from "@capacitor/preferences";
import { defineStore } from "pinia";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const useSettingsStore = defineStore('config', () => {

    const isInitialized = ref(false);
    const locale = i18n.locale

    const installPromptEvent = ref<Event | null>(null);

    const init = async () => {
        if ('Notification' in window && navigator.serviceWorker) {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    // Разрешение получено, ничего дополнительно делать не нужно
                }
            });
        }
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        await Promise.all([
            Preferences.get({ key: 'locale' }).then(({ value }) => {
                if (value)
                    locale.value = value as typeof i18n.availableLocales[number]
            })
        ])

        isInitialized.value = true;
    }

    const changeLocale = (newLocale: typeof i18n.availableLocales[number]) => {
        if (i18n.availableLocales.includes(newLocale)) {
            Preferences.set({ key: 'locale', value: newLocale })
                .then(() =>
                    i18n.locale.value = newLocale
                )
        }
    }

    // Обработчик события beforeinstallprompt
    function handleBeforeInstallPrompt(event: Event) {
        event.preventDefault();
        installPromptEvent.value = event;
    }

    // Функция установки PWA
    const installPWA = () => {
        if (installPromptEvent.value) {
            (installPromptEvent.value as any).prompt();
            (installPromptEvent.value as any).userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Пользователь установил приложение');
                } else {
                    console.log('Пользователь отказался от установки');
                }
                installPromptEvent.value = null; // Сбросим событие после завершения
            });
        }
    };


    const getters = {
        isInitialized: computed(() => isInitialized.value),
        locale: computed(() => locale.value),
        installPromptEvent: computed(() => installPromptEvent.value)
    }

    return {
        init,
        changeLocale,
        installPWA,
        ...getters,
    }
})

export default useSettingsStore