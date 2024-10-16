<script setup lang="ts">
import { IonItem, IonToggle } from '@ionic/vue';


const { label } = defineProps<{
    label?: string,
}>()

const model = defineModel<boolean>();

</script>

<template>
    <IonToggle v-model="model"  label-placement="stacked" class="custom-toggle">
        {{ label }}
    </IonToggle>
</template>

<style scoped>
.custom-toggle {
    min-height: 56px;
}
</style>