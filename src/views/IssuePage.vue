<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import api from '@/utils/api';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { onMounted } from 'vue';

const tt = useTtStore()

onMounted(() => {
    api.GET('/tt/issues', {
        project: tt.meta?.projects[0].acronym || '',
        // filter: tt.meta?.filters[0] || '12'
    })
        .then(res => {
            console.log(res);
        })
})

</script>

<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>issue 0</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent class="ion-padding">
            <IonList>
                <IonItem v-for="project in tt.meta?.projects" button>
                    <IonLabel>{{ project.acronym }}</IonLabel>
                </IonItem>
            </IonList>
        </IonContent>
    </IonPage>
</template>

<style scoped></style>