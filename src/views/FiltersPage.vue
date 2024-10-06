<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import api from '@/utils/api';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const tt = useTtStore()
const router = useRouter()

const project = router.currentRoute.value.query['project']

const filters = computed(() => tt.meta?.projects.find(p => p.acronym === project)?.filters)

</script>

<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>filters</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent class="ion-padding">
            <IonList>
                <IonItem v-for="filter in filters" button>
                    <IonLabel>{{ filter.filter }}</IonLabel>
                </IonItem>
            </IonList>
        </IonContent>
    </IonPage>
</template>

<style scoped></style>