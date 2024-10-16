<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import api from '@/utils/api';
import { IonInput, IonItem, IonList, IonChip, IonIcon, IonLabel } from '@ionic/vue';
import { ref } from 'vue';
import { closeCircle } from 'ionicons/icons';

type Suggestion = { id: string, text: string };

const { field, options, label, multiple, getSuggestion } = defineProps<{
    field: string,
    options?: Suggestion[],
    label?: string,
    labelPlacement?: string,
    multiple?: boolean,
    getSuggestion?: (query: string) => Promise<any>
}>()

const tt = useTtStore();
const query = defineModel<string | string[]>({ default: '' });
const selectedText = ref('');
const selectedItems = ref<Suggestion[]>([]);
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
            return suggestion.text.toLowerCase().includes(selectedText.value.toLowerCase());
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
    if (multiple) {
        if (!selectedItems.value.find(item => item.id === suggestion.id)) {
            selectedItems.value.push(suggestion);
            if (Array.isArray(query.value))
                (query.value as string[]).push(suggestion.id);
            else
                query.value = [suggestion.id]
        }
        selectedText.value = '';
    } else {
        selectedText.value = suggestion.text;
        query.value = suggestion.id;
    }

    showSuggestions.value = false;
};

// Удаление выбранного элемента (актуально только для множественного выбора)
const removeSelectedItem = (index: number) => {
    selectedItems.value.splice(index, 1);
    (query.value as string[]).splice(index, 1);
};

const hideSuggestions = () => {
    setTimeout(() => {
        showSuggestions.value = false;
    }, 500);
};
</script>

<template>
    <div style="width: 100%;">
        <!-- Отображение выбранных элементов с возможностью удаления (если multiple=true) -->
        <div v-if="multiple">
            <IonChip v-for="(item, index) in selectedItems" :key="item.id">
                <IonLabel>{{ item.text }}</IonLabel>
                <IonIcon @click="removeSelectedItem(index)" :icon="closeCircle"></IonIcon>
            </IonChip>
        </div>

        <!-- Поле ввода для поиска предложений -->
        <IonInput v-model="selectedText" @input="onInput" @ionFocus="showSuggestions = true" @ionBlur="hideSuggestions"
            :label="label || field" labelPlacement="floating" placeholder="Начните ввод для поиска">
        </IonInput>

        <!-- Список предложений -->
        <IonList v-if="showSuggestions">
            <IonItem v-for="(suggestion, index) in filteredSuggestions" :key="index" button
                @click="selectSuggestion(suggestion)">
                {{ suggestion.text }}
            </IonItem>
        </IonList>
    </div>
</template>

<style scoped>
ion-list {
    max-height: 200px;
    overflow-y: auto;
}

ion-chip {
    margin-right: 4px;
}

ion-icon {
    cursor: pointer;
}
</style>
