<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonTitle, IonToolbar } from '@ionic/vue';
import { arrowDown, arrowUp } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const tt = useTtStore()

const isOpen = ref(false);

const project = computed(() => tt.project)

const handler = (project: Project) => {
    tt.project = project
    dismiss()
}

const dismiss = () => {
    isOpen.value = false
}

</script>

<template>
    <IonInput :label="$t('project')" labelPlacement="floating" @ionFocus="isOpen = true" :value="project?.project"
        readonly />

    <IonModal :is-open="isOpen" @willDismiss="dismiss">
        <IonHeader>
            <IonToolbar>
                <IonTitle>{{ $t('projects') }}</IonTitle>
                <IonButtons slot="end">
                    <IonButton @click="dismiss">{{ $t('close') }}</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonList>
                <IonItem v-for="(project, key) in tt.meta?.projects" :key="key" button @click="handler(project)">
                    <IonLabel>{{ project.project }}</IonLabel>
                </IonItem>
            </IonList>
        </IonContent>
    </IonModal>
</template>