<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import api from '@/utils/api';
import { IonInput, IonItem, IonList } from '@ionic/vue';
import { ref } from 'vue';

const { field, variants, label, text, getSuggestion } = defineProps<{
    field: string,
    variants?: string[],
    label?: string,
    labelPlacement?: string,
    text?: Record<string, string>,
    getSuggestion?: (query: string) => Promise<any>
}>()

const tt = useTtStore();
const query = defineModel<string>({ default: null });
const showSuggestions = ref(false);
const filteredSuggestions = ref<string[]>([]);

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
    if (variants) {
        filteredSuggestions.value = variants.filter((suggestion) =>
            suggestion.toLowerCase().includes(query.value.toLowerCase())
        );
    } else if (getSuggestion && query.value) {
        getSuggestion(query.value)
            .then(res => {
                filteredSuggestions.value = res;
            });
    }
}, 500);

const onInput = () => {
    debouncedOnInput();
};

const selectSuggestion = (suggestion: string) => {
    query.value = suggestion;
    showSuggestions.value = false;
};

const hideSuggestions = () => {
    setTimeout(() => {
        showSuggestions.value = false;
    }, 500);
};
</script>

<template>
    <IonInput v-model="query" @input="onInput" @ionFocus="showSuggestions = true" @ionBlur="hideSuggestions"
        :label="label || field" labelPlacement="floating" />
    <IonList v-if="showSuggestions">
        <IonItem v-for="(suggestion, index) in filteredSuggestions" :key="index" button
            @click="selectSuggestion(suggestion)">
            {{ text ? text[suggestion] : suggestion }}
        </IonItem>
    </IonList>
</template>

<style scoped>
ion-list {
    max-height: 200px;
    overflow-y: auto;
}
</style>
