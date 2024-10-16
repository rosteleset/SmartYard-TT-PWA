<script setup lang="ts">
import { IonInput, IonItem, IonList } from '@ionic/vue';
import { ref } from 'vue';

type Suggestion = { id: string, text: string };

const { options, label, getSuggestion } = defineProps<{
    options?: Suggestion[],
    label?: string,
    labelPlacement?: string,
    getSuggestion?: (query: string) => Promise<any>
}>()

const query = defineModel<string>({ default: null });
const selectedText = ref(''); // отображаемое значение
const showSuggestions = ref(false);
const filteredSuggestions = ref<Suggestion[]>([]);

// Функция debounce
const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

// Дебаунсированная функция для обработки ввода
const debouncedOnInput = debounce(() => {

    if (options && options.length > 0) {
        filteredSuggestions.value = options.filter((suggestion) => {
            return suggestion.text.toLowerCase().includes(selectedText.value.toLowerCase())
        });
    } else if (getSuggestion && selectedText.value) {
        getSuggestion(selectedText.value)
            .then(res => {
                filteredSuggestions.value = res;
            });
    }
}, 500);

const onInput = () => {
    debouncedOnInput();
};

const selectSuggestion = (suggestion: Suggestion) => {
    query.value = suggestion.id; // сохраняем id в модель
    selectedText.value = suggestion.text; // отображаем text
    showSuggestions.value = false;
};

// Функция для сохранения введенного текста, если он не совпадает с предложениями
const saveEnteredValue = () => {
    const matchingSuggestion = filteredSuggestions.value.find(suggestion => suggestion.text.toLowerCase() === selectedText.value.toLowerCase());

    if (!matchingSuggestion) {
        // Если совпадений нет, сохраняем введенный текст в query
        query.value = selectedText.value;
    }
};

const hideSuggestions = () => {
    saveEnteredValue();
    setTimeout(() => {
        showSuggestions.value = false;
    }, 500);
};
</script>

<template>
    <IonInput v-model="selectedText" @input="onInput" @ionFocus="showSuggestions = true" @ionBlur="hideSuggestions"
        :label="label" labelPlacement="floating">
        <IonList v-if="showSuggestions">
            <IonItem v-for="(suggestion, index) in filteredSuggestions" :key="index" button
                @click="selectSuggestion(suggestion)">
                {{ suggestion.text }}
            </IonItem>
        </IonList>
    </IonInput>
</template>

<style scoped>
ion-list {
    max-height: 200px;
    overflow-y: auto;
}
</style>
