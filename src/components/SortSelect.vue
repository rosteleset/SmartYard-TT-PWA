<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonTitle, IonToolbar } from '@ionic/vue';
import { arrowDown, arrowUp } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const tt = useTtStore()
const { t } = useI18n()

const isOpen = ref(false);

const projections = computed(() => {
    return Object.keys(tt.projection)
        .filter(p => {
            if (tt.filter && tt.meta?.filtersExt[tt.filter?.filter].hide?.includes(p))
                return false
            if (p.substring(0, 4) === "_cf_" && tt.meta?.customFields.find(cf => cf.field === p.substring(4))?.type === 'virtual')
                return false
            return true
        })
        .reduce((acc, p) => {
            const cf = p.substring(0, 4) === "_cf_" && tt.meta?.customFields.find(cf => cf.field === p.substring(4))
            const label = cf ? cf.fieldDisplay : t(p)
            acc[label] = p;
            return acc;
        }, {} as Record<string, string>);
})

const handler = (projection: string) => {
    // tt.sortBy ? tt.sortBy.target = projection :tt.sortBy = {}
    tt.sortBy = { target: projection, direction: tt.sortBy?.direction === 1 ? -1 : 1 }
}

const dismiss = () => {
    isOpen.value = false
}
</script>

<template>
    <IonInput :label="$t('sortBy')" labelPlacement="floating" @ionFocus="isOpen = true"
        :value="tt.sortBy?.target && projections[tt.sortBy?.target]" readonly />

    <IonModal :is-open="isOpen" @willDismiss="dismiss">
        <IonHeader>
            <IonToolbar>
                <IonTitle>{{ $t('sortBy') }}</IonTitle>
                <IonButtons slot="end">
                    <IonButton @click="dismiss">{{ $t('close') }}</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonList>
                <IonItem v-for="(key, label) in projections" button @click="handler(key)">
                    <IonLabel>{{ label }}</IonLabel>
                    <IonIcon v-if="tt.sortBy && tt.sortBy.target == key"
                        :icon="tt.sortBy.direction === -1 ? arrowUp : arrowDown" />
                </IonItem>
            </IonList>
        </IonContent>
    </IonModal>
</template>