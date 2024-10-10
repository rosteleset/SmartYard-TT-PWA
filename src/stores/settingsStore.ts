import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {Preferences} from "@capacitor/preferences";
import {i18n} from "@/i18n";

const useSettingsStore = defineStore('config', () => {

    const isInitialized = ref(false);
    const locale = i18n.locale

    const init = async () => {
        await Promise.all([
            Preferences.get({key: 'locale'}).then(({value}) => {
                if (value)
                    locale.value = value as typeof i18n.availableLocales[number]
            })
        ])

        isInitialized.value = true;
    }

    const changeLocale = (newLocale: typeof i18n.availableLocales[number]) => {
        if (i18n.availableLocales.includes(newLocale)) {
            Preferences.set({key: 'locale', value: newLocale})
                .then(() =>
                    i18n.locale.value = newLocale
                )
        }
    }

    const getters = {
        isInitialized: computed(() => isInitialized.value),
        locale: computed(() => locale.value),
    }

    return {
        init,
        changeLocale,
        ...getters,
    }
})

export default useSettingsStore