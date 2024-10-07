<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue';
import { useTtStore } from '@/stores/ttStore';
import { IonContent, IonPage } from '@ionic/vue';

const tt = useTtStore()


</script>

<template>
    <IonPage>
        <PageHeader label="issues" default-href="/tt/" />

        <IonContent>
        </IonContent>
    </IonPage>
</template>

<style scoped></style>