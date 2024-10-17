<script setup lang="ts">
import { useTtStore } from "@/stores/ttStore";
import {
    IonAccordionGroup,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonList,
    IonModal,
    IonRadioGroup,
    IonTitle,
    IonToolbar
} from "@ionic/vue";
import { computed, ref } from "vue";
import NestedFilterGroup from "./NestedFilterGroup.vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const { push } = useRouter()
const tt = useTtStore()

const isOpen = ref(false);
const workingSelectedValue = ref(tt.filter);

const grouped = computed(() =>
    tt.project ? buildNestedGroups(tt.project.filters.map(filter => tt.getFilterWithLabel(filter.filter))) : null
)

function buildNestedGroups(filters: FilterWithLabel[]): GroupedFilters {
    const res: GroupedFilters = {
        label: 'root',
        children: [],
        filters: []
    };

    // Функция для поиска или создания новой группы
    const findOrCreateGroup = (groups: GroupedFilters[], label: string): GroupedFilters => {
        let group = groups.find(g => g.label === label);
        if (!group) {
            group = { label, children: [], filters: [] };
            groups.push(group);
        }
        return group;
    };

    for (const filter of filters) {
        const labels = filter.label.split(' / ');
        let prevGroup: GroupedFilters | undefined;

        labels.forEach((label, index) => {
            const isLastLabel = index === labels.length - 1;

            if (index === 0) {
                // Работаем с корневой группой на первом уровне
                if (isLastLabel)
                    res.filters?.push(filter)
                else
                    prevGroup = findOrCreateGroup(res.children || [], label);
            } else if (isLastLabel && prevGroup) {
                // Если это последний уровень, добавляем фильтр
                prevGroup.filters ? prevGroup.filters.push({ ...filter, label }) : prevGroup.filters = [{ ...filter, label }];
            } else {
                // Работаем с вложенными группами
                prevGroup = findOrCreateGroup(prevGroup?.children ?? [], label);
            }
        });
    }

    return res; // Возвращаем результат
}

const handleSelect = (filter: FilterWithLabel) => {
    push({ query: { ...route.query, filter: filter.filter } });
    isOpen.value = false
}

</script>

<template>
    <IonInput label="filter" labelPlacement="floating" ed @ionFocus="isOpen = true" :value="tt.filter?.label" readonly ></IonInput>
    <IonModal :is-open="isOpen">
        <IonHeader>
            <IonToolbar>
                <IonTitle>{{ $t('filter') }}</IonTitle>
                <IonButtons slot="end">
                    <IonButton @click="isOpen = false">{{ $t('cancel') }}</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonList>
                <IonRadioGroup v-model="workingSelectedValue">
                    <IonAccordionGroup multiple>
                        <NestedFilterGroup v-if="grouped" :group="grouped" @select="handleSelect" />
                    </IonAccordionGroup>
                </IonRadioGroup>
            </IonList>
        </IonContent>
    </IonModal>
</template>

<style scoped></style>