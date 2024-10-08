import { createI18n } from 'vue-i18n'
import ru from './locales/ru.json'
import en from './locales/en.json'

const fallbackLocale = 'ru'

const messages = {
    en: en,
    ru: ru,
};

// Создаем и возвращаем экземпляр i18n
const instance = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale,
    messages
})

export default instance;

export const i18n = instance.global;
