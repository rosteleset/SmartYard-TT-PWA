<script setup lang="ts">
import { IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonTitle, IonToolbar, useIonRouter } from '@ionic/vue';
import { cog } from 'ionicons/icons';
import SelectFilter from './SelectFilter.vue';
import SelectProject from './SelectProject.vue';
import SelectSort from './SelectSort.vue';

const {push} = useIonRouter()

</script>

<template>
    <IonMenu menuId="issuesMenu" contentId="issues">
        <IonHeader>
            <IonToolbar>
                <IonTitle>{{ $t('filters') }}</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent class="">
            <div class="flex-box ">
                <div class="flex-item ion-padding">
                    <SelectProject />

                    <SelectFilter />

                    <SelectSort />
                </div>
                <div>
                    <IonList>
                        <IonItem button @click="push('/settings')">
                            <IonIcon :icon="cog"/>
                            <IonLabel>{{ $t('settings-page') }}</IonLabel>
                        </IonItem>
                    </IonList>
                </div>
            </div>
        </IonContent>
    </IonMenu>
</template>

<style scoped>
.flex-box {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.flex-item {
    flex: 1;
}
</style>