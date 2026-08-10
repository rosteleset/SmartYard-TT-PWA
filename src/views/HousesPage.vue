<script setup lang="ts">
import useOperationsFeedback from '@/hooks/useOperationsFeedback';
import { useOperationsStore } from '@/stores/operationsStore';
import type { RbtHouseSummary } from '@/types/operations';
import {
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonProgressBar,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    SearchbarCustomEvent,
} from '@ionic/vue';
import { business } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const operations = useOperationsStore();
const { failure } = useOperationsFeedback();
const router = useRouter();
const loading = ref(false);

async function search(event: SearchbarCustomEvent) {
    loading.value = true;
    try {
        await operations.searchHouses(event.detail.value || '');
    } catch (error) {
        await failure(error);
    } finally {
        loading.value = false;
    }
}

async function openHouse(house: RbtHouseSummary) {
    operations.selectHouse(house);
    await router.push({
        name: 'house',
        params: { id: house.houseId },
        query: { title: house.houseFull || '' },
    });
}
</script>

<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>{{ $t('operations.houses.title') }}</IonTitle>
            </IonToolbar>
            <IonToolbar>
                <IonSearchbar
                    :value="operations.houseQuery"
                    :debounce="350"
                    :placeholder="$t('operations.houses.search')"
                    @ionInput="search"
                />
            </IonToolbar>
            <IonProgressBar v-if="loading" type="indeterminate" />
        </IonHeader>

        <IonContent>
            <IonList v-if="operations.houseResults.length" inset>
                <IonItem
                    v-for="house in operations.houseResults"
                    :key="house.houseId"
                    button
                    detail
                    @click="openHouse(house)"
                >
                    <IonIcon slot="start" :icon="business" color="primary" />
                    <IonLabel>
                        <h2>{{ house.houseFull || `${$t('operations.houses.house')} #${house.houseId}` }}</h2>
                        <p>ID {{ house.houseId }}</p>
                    </IonLabel>
                </IonItem>
            </IonList>
            <div v-else class="empty-state">
                <IonIcon :icon="business" />
                <p>{{ operations.houseQuery.length >= 3 ? $t('operations.houses.notFound') : $t('operations.houses.hint') }}</p>
            </div>
        </IonContent>
    </IonPage>
</template>

<style scoped>
.empty-state {
    min-height: 45vh;
    display: grid;
    place-content: center;
    justify-items: center;
    padding: 24px;
    color: var(--ion-color-medium);
    text-align: center;
}

.empty-state ion-icon {
    font-size: 42px;
}
</style>
