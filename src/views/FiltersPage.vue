<script setup lang="ts">
import NestedFilterGroup from '@/components/NestedFilterGroup.vue';
import PageHeader from '@/components/PageHeader.vue';
import { useTtStore } from '@/stores/ttStore';
import api from '@/utils/api';
import { IonContent, IonHeader, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';


const tt = useTtStore()
const { currentRoute } = useRouter()

const project = tt.getProjectByAcronym(currentRoute.value.query['project'] as string)

const grouped = computed(() =>
    buildNestedGroups(project.filters.map(filter => tt.getFilterWithLabel(filter.filter, project)))
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

</script>

<template>
    <IonPage>
        <PageHeader :label="`${project?.acronym}: filters`" default-href="/tt/" />

        <IonContent>
            <NestedFilterGroup :group="grouped" :project="project" />
        </IonContent>
    </IonPage>
</template>

<style scoped></style>