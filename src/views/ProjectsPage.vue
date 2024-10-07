<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import api from '@/utils/api';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const tt = useTtStore()
const router = useRouter()

const handler = (project:Project) => {
    router.push({ name: 'filters', query: { project: project.acronym } })
}

</script>

<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>Projects</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent>
            <IonList>
                <IonItem v-for="project in tt.meta?.projects" @click="handler(project)" button detail>
                    <IonLabel>{{ project.acronym }}</IonLabel>
                </IonItem>
            </IonList>
        </IonContent>
    </IonPage>
</template>

<style scoped></style>