<script setup lang="ts">
import { IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonList } from '@ionic/vue';
import { useRouter } from 'vue-router';

const { group, project } = defineProps<{ group: GroupedFilters, project: string }>()

const router = useRouter()

const handler = (filter: GroupedFilter) => {
    router.push({ name: 'issues', query: { project: project, filter: filter.filter } })
}

</script>

<template>
    <IonAccordionGroup v-if="group.children?.length > 0" :multiple="true">
        <IonAccordion v-for="children in group.children" :value="children.label">
            <IonItem slot="header">
                <IonLabel>{{ children.label }}</IonLabel>
            </IonItem>
            <div slot="content">
                <NestedFilterGroup :group="children" :project="project" />
            </div>
        </IonAccordion>
    </IonAccordionGroup>
    <IonItem v-if="group.filters?.length > 0" v-for="filter in group.filters" @click="handler(filter)" button detail>
        <IonLabel>{{ filter.label }}</IonLabel>
    </IonItem>
</template>