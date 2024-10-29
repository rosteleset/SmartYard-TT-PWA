<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import { IonAccordion, IonItem, IonLabel } from '@ionic/vue';

const { group, depth = 0 } = defineProps<{ group: GroupedFilters, depth?: number }>()

const emits = defineEmits<{
    select: [filter: FilterWithLabel]
}>()

const tt = useTtStore()

const filterFilters = (filters: FilterWithLabel[]) => {
    return filters.sort((a, b) => a.label.localeCompare(b.label))
}

const handleSelect = (filter: FilterWithLabel) => {
    emits('select', filter);
}

</script>

<template>
    <template v-if="group.children?.length > 0">
        <IonAccordion v-for="children in group.children" :key="children.label" :value="children.label">
            <IonItem slot="header">
                <IonLabel :class="`neasted-${depth}`">{{ children.label }}</IonLabel>
            </IonItem>
            <div slot="content">
                <NestedFilterGroup :group="children" :depth="depth + 1" @select="handleSelect" />
            </div>
        </IonAccordion>
    </template>
    <template v-if="group.filters?.length > 0">
        <IonItem v-for="filter in filterFilters(group.filters)" :key="filter.label" :value="filter"
            :color="tt.filter?.filter === filter.filter ? 'primary' : ''" @click="emits('select', filter)" button>
            <IonLabel :style="{ '--depth': depth }" class="neasted">{{ filter.label }}</IonLabel>
        </IonItem>
    </template>
</template>

<style scoped>
.neasted {
    padding-left: calc(var(--depth, 0) * 5px);
}
</style>