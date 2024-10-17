<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import { IonContent, IonHeader, IonMenu, IonSelect, IonSelectOption, IonTitle, IonToolbar, SelectChangeEventDetail } from '@ionic/vue';
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FilterSelect from './FilterSelect.vue';
import { Preferences } from '@capacitor/preferences';

const tt = useTtStore()
const { push } = useRouter()
const route = useRoute();

const project = computed(() => tt.project)
const filter = computed(() => tt.filter)


const handlerProject = (event: CustomEvent<SelectChangeEventDetail<Project>>) => {
    push({ query: { ...route.query, project: event.detail.value.acronym } })
}



</script>

<template>
    <IonMenu content-id="issues" type="push">
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
        </IonContent>
    </IonMenu>
</template>