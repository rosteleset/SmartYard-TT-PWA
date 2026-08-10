<script setup lang="ts">
import { useTtStore } from '@/stores/ttStore';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonModal, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, ref } from 'vue';

const tt = useTtStore()

const isOpen = ref(false);
const pendingProject = ref<Project>();

const project = computed(() => tt.project)

const open = () => {
    isOpen.value = true
}

const handler = (project: Project) => {
    pendingProject.value = project
    dismiss()
}

const dismiss = () => {
    isOpen.value = false
}

const applySelection = () => {
    if (!pendingProject.value)
        return

    const project = pendingProject.value
    pendingProject.value = undefined
    tt.project = project
}

</script>

<template>
    <IonInput
        :label="$t('project')"
        labelPlacement="floating"
        :value="project?.project"
        readonly
        @click="open"
        @keydown.enter.prevent="open"
        @keydown.space.prevent="open"
    />

    <IonModal :is-open="isOpen" @willDismiss="dismiss" @didDismiss="applySelection">
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
