<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import api from '@/utils/api';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const tt = useTtStore()
const router = useRouter()

</script>

<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>Projects</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent class="ion-padding">
            <IonList>
                <IonItem v-for="project in tt.meta?.projects"
                    @click="router.push({ name: 'filters', query: { project: project.acronym } })" button>
                    <IonLabel>{{ project.acronym }}</IonLabel>
                </IonItem>
            </IonList>
        </IonContent>
    </IonPage>
</template>

<style scoped></style>