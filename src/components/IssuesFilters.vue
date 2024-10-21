<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import { IonContent, IonHeader, IonMenu, IonSelect, IonSelectOption, IonTitle, IonToolbar, SelectChangeEventDetail } from '@ionic/vue';
import { computed } from 'vue';
import FilterSelect from './FilterSelect.vue';
import SortSelect from './SortSelect.vue';

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
            <IonSelect :label="$t('project')" label-placement="floating" interface="alert" v-model:value="project"
                @ionChange="handlerProject">
                <IonSelectOption v-for="project in tt.meta?.projects" :key="project.acronym" :value="project">
                    {{ project.project }}
                </IonSelectOption>
            </IonSelect>

            <FilterSelect />

            <SortSelect />

        </IonContent>
    </IonMenu>
</template>