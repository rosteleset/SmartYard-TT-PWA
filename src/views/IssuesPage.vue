<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import api from '@/utils/api';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { onMounted } from 'vue';

const tt = useTtStore()


</script>

<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>issues</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent>
        </IonContent>
    </IonPage>
</template>

<style scoped></style>