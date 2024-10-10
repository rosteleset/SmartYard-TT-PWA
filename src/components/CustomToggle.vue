<script setup lang="ts">
import { IonToggle } from '@ionic/vue';


const { field, label } = defineProps<{
    field: string,
    label?: string,
}>()

const model = defineModel<boolean>();

</script>

<template>
    <IonToggle v-model="model">
        {{ label || field }}
    </IonToggle>
</template>