<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import { IonContent, IonHeader, IonMenu, IonTitle, IonToolbar, SelectChangeEventDetail } from '@ionic/vue';
import { computed } from 'vue';
import SelectProject from './SelectProject.vue';
import SelectFilter from './SelectFilter.vue';
import SelectSort from './SelectSort.vue';

const tt = useTtStore()

const project = computed(() => tt.project)

const handlerProject = (event: CustomEvent<SelectChangeEventDetail<Project>>) => {
    tt.project = tt.getProjectByAcronym(event.detail.value.acronym)
}

</script>

<template>
    <IonMenu menuId="issuesMenu" contentId="issues">
        <IonHeader>
            <IonToolbar>
                <IonTitle>{{ $t('filters') }}</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent class="ion-padding">
            <SelectProject />

            <SelectFilter />

            <SelectSort />

        </IonContent>
    </IonMenu>
</template>