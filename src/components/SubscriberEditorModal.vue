<script setup lang="ts">
import type { RbtSubscriber, SubscriberFormValue } from '@/types/operations';
import { subscriberRole } from '@/utils/operations';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonList,
    IonModal,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
} from '@ionic/vue';
import { reactive, watch } from 'vue';

const props = defineProps<{
    open: boolean;
    saving: boolean;
    subscriber: RbtSubscriber | null;
    flatId: number;
}>();
const emit = defineEmits<{
    dismiss: [];
    save: [value: SubscriberFormValue];
}>();

const form = reactive<SubscriberFormValue>({
    mobile: '',
    subscriberLast: '',
    subscriberName: '',
    subscriberPatronymic: '',
    role: 'resident',
});

watch(
    () => [props.open, props.subscriber] as const,
    ([open, subscriber]) => {
        if (!open)
            return;
        form.mobile = subscriber?.mobile || '';
        form.subscriberLast = subscriber?.subscriberLast || '';
        form.subscriberName = subscriber?.subscriberName || '';
        form.subscriberPatronymic = subscriber?.subscriberPatronymic || '';
        form.role = subscriber ? subscriberRole(subscriber, props.flatId) : 'resident';
    },
    { immediate: true },
);
</script>

<template>
    <IonModal
        :is-open="open"
        :initial-breakpoint="0.86"
        :breakpoints="[0, 0.55, 0.86, 1]"
        :handle="true"
        @didDismiss="emit('dismiss')"
    >
        <IonHeader>
            <IonToolbar>
                <IonButtons slot="start">
                    <IonButton @click="emit('dismiss')">{{ $t('cancel') }}</IonButton>
                </IonButtons>
                <IonTitle class="editor-title">
                    {{ subscriber ? $t('operations.subscribers.edit') : $t('operations.subscribers.add') }}
                </IonTitle>
                <IonButtons slot="end">
                    <IonButton :disabled="saving || !form.mobile.trim()" strong @click="emit('save', { ...form })">
                        {{ $t('save') }}
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonList inset>
                <IonItem>
                    <IonInput
                        v-model="form.mobile"
                        :label="$t('operations.subscribers.mobile')"
                        label-placement="stacked"
                        inputmode="tel"
                    />
                </IonItem>
                <IonItem>
                    <IonInput v-model="form.subscriberLast" :label="$t('operations.subscribers.last')" label-placement="stacked" />
                </IonItem>
                <IonItem>
                    <IonInput v-model="form.subscriberName" :label="$t('operations.subscribers.name')" label-placement="stacked" />
                </IonItem>
                <IonItem>
                    <IonInput v-model="form.subscriberPatronymic" :label="$t('operations.subscribers.patronymic')" label-placement="stacked" />
                </IonItem>
                <IonItem>
                    <IonSelect v-model="form.role" :label="$t('operations.subscribers.role')" label-placement="stacked">
                        <IonSelectOption value="resident">{{ $t('operations.subscribers.resident') }}</IonSelectOption>
                        <IonSelectOption value="owner">{{ $t('operations.subscribers.owner') }}</IonSelectOption>
                    </IonSelect>
                </IonItem>
            </IonList>
        </IonContent>
    </IonModal>
</template>

<style scoped>
.editor-title {
    padding-inline: 0;
    font-size: 14px;
}
</style>
