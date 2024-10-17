<script setup lang="ts">
import { IonAccordion, IonItem, IonLabel } from '@ionic/vue';

const { group, depth = 0 } = defineProps<{ group: GroupedFilters, depth?: number }>()

const emits = defineEmits<{
    select: [filter: FilterWithLabel]
}>()

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
        <IonItem v-for="filter in group.filters.sort((a,b)=>a.label.localeCompare(b.label))" :key="filter.label" :value="filter" @click="emits('select', filter)" button>
            <IonLabel :class="`neasted-${depth}`">{{ filter.label }}</IonLabel>
        </IonItem>
    </template>
</template>

<style lang="scss">
@for $i from 0 through 5 {
    .neasted {
        &-#{$i} {
            padding-left: #{$i * 5}px;
        }
    }
}
</style>