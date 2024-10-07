<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue';
import { useTtStore } from '@/stores/ttStore';
import api from '@/utils/api';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { onMounted } from 'vue';

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