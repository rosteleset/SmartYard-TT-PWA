<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import { IonContent, IonHeader, IonMenu, IonSelect, IonSelectOption, IonTitle, IonToolbar, SelectChangeEventDetail } from '@ionic/vue';
import { computed } from 'vue';
import NestedFilterSelect from './NestedFilterSelect.vue';
import { useRoute, useRouter } from 'vue-router';

const tt = useTtStore()
const { push, replace } = useRouter()
const route = useRoute();

const project = computed(() => tt.project)
const filter = computed(() => tt.filter)


const grouped = computed(() =>
    tt.project ? buildNestedGroups(tt.project.filters.map(filter => tt.getFilterWithLabel(filter.filter))) : null
)

function buildNestedGroups(filters: FilterWithLabel[]): GroupedFilters {
    let res: GroupedFilters = {
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

const compareWith = (o1: FilterWithLabel, o2: FilterWithLabel) => {
    return o1 && o2 ? o1.filter === o2.filter : o1 === o2;
}

const handlerProject = (event: CustomEvent<SelectChangeEventDetail<Project>>) => {
    push({ query: { ...route.query, project: event.detail.value.acronym } })
}

const handlerFilter = (event: CustomEvent<SelectChangeEventDetail<FilterWithLabel>>) => {

    replace({ path: route.path, query: { ...route.query, filter: event.detail.value.filter } })
}

</script>

<template>
    <IonMenu content-id="issues" type="push">
        <IonHeader>
            <IonToolbar>
                <IonTitle>{{ $t('filters') }}</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent class="ion-padding">
            <IonSelect label="project" label-placement="floating" interface="popover" v-model:value="project"
                @ionChange="handlerProject">
                <IonSelectOption v-for="project in tt.meta?.projects" :key="project.acronym" :value="project">
                    {{ project.project }}
                </IonSelectOption>
            </IonSelect>

            <IonSelect label="filter" label-placement="floating" interface="popover" v-model:value="filter"
                @ionChange="handlerFilter" :compareWith="compareWith">
                <NestedFilterSelect v-if="grouped" :group="grouped" />
            </IonSelect>
        </IonContent>
    </IonMenu>
</template>