<script setup lang="ts">
import { IonSelectOption } from '@ionic/vue';

const { group, depth = 0 } = defineProps<{ group: GroupedFilters, depth?: number }>()

</script>

<template>
    <template v-if="group.children?.length > 0">
        <template v-for="children in group.children">
            <IonSelectOption disabled :class="`neasted-${depth}`">{{ children.label }}</IonSelectOption>
            <NestedFilterSelect :group="children" :depth="depth + 1" />
        </template>
    </template>
    <IonSelectOption v-if="group.filters?.length > 0" v-for="filter in group.filters" :class="`neasted-${depth}`"
        :value="filter">
        {{ filter.label }}
    </IonSelectOption>
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