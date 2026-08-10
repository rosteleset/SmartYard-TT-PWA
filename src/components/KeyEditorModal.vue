<script setup lang="ts">
import type { KeyFormValue } from '@/types/operations';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonList,
    IonModal,
    IonTitle,
    IonToolbar,
} from '@ionic/vue';
import { reactive, watch } from 'vue';

const props = defineProps<{ open: boolean; saving: boolean }>();
const emit = defineEmits<{
    dismiss: [];
    save: [value: KeyFormValue];
}>();

const form = reactive<KeyFormValue>({ rfId: '', comments: '' });

watch(() => props.open, open => {
    if (open) {
        form.rfId = '';
        form.comments = '';
    }
});
</script>

<template>
    <IonModal
        :is-open="open"
        :initial-breakpoint="0.72"
        :breakpoints="[0, 0.5, 0.72, 1]"
        :handle="true"
        @didDismiss="emit('dismiss')"
    >
        <IonHeader>
            <IonToolbar>
                <IonButtons slot="start">
                    <IonButton @click="emit('dismiss')">{{ $t('cancel') }}</IonButton>
                </IonButtons>
                <IonTitle class="editor-title">{{ $t('operations.keys.add') }}</IonTitle>
                <IonButtons slot="end">
                    <IonButton :disabled="saving || !form.rfId.trim()" strong @click="emit('save', { ...form })">
                        {{ $t('save') }}
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonList inset>
                <IonItem>
                    <IonInput
                        v-model="form.rfId"
                        :label="$t('operations.keys.id')"
                        label-placement="stacked"
                        inputmode="text"
                        autocapitalize="characters"
                    />
                </IonItem>
                <IonItem>
                    <IonInput
                        v-model="form.comments"
                        :label="$t('operations.keys.comment')"
                        label-placement="stacked"
                    />
                </IonItem>
            </IonList>
        </IonContent>
    </IonModal>
</template>

<style scoped>
.editor-title {
    padding-inline: 0;
    font-size: 16px;
}
</style>
