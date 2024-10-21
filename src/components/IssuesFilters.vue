<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import { IonContent, IonHeader, IonIcon, IonMenu, IonSelect, IonSelectOption, IonTitle, IonToolbar, SelectChangeEventDetail } from '@ionic/vue';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FilterSelect from './FilterSelect.vue';
import { useI18n } from 'vue-i18n';
import { pulseOutline } from 'ionicons/icons';
import SortSelect from './SortSelect.vue';

const tt = useTtStore()
const { t } = useI18n()
const { push } = useRouter()
const route = useRoute();

const project = computed(() => tt.project)

const cortBy = computed(() => {
    return Object.keys(tt.projection).filter(p => {
        if (tt.filter && tt.meta?.filtersExt[tt.filter?.filter].hide?.includes(p))
            return false
        if (p.substring(0, 4) === "_cf_" && tt.meta?.customFields.find(cf => cf.field === p.substring(4))?.type === 'virtual')
            return false
        return true
    }).map(p => {
        const cf = p.substring(0, 4) === "_cf_" && tt.meta?.customFields.find(cf => cf.field === p.substring(4))
        return {
            label: cf ? cf.fieldDisplay : t(p),
            value: p
        }
    })
})

const handlerProject = (event: CustomEvent<SelectChangeEventDetail<Project>>) => {
    push({ query: { ...route.query, project: event.detail.value.acronym } })
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
            <IonSelect label="sort">
                <IonSelectOption v-for="f in cortBy">
                    <IonIcon :name="pulseOutline"></IonIcon>
                    {{ f.label }}
                </IonSelectOption>
            </IonSelect>

        </IonContent>
    </IonMenu>
</template>