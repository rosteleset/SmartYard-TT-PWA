<script setup lang="ts">
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    SearchbarCustomEvent
} from "@ionic/vue";
import { ellipsisHorizontal, ellipsisVertical } from "ionicons/icons";
import { computed, getCurrentInstance } from "vue";

const { label, defaultHref = '/' } = defineProps<{
    label: string,
    defaultHref?: string
}>()

const emit = defineEmits<{
    search: [event: SearchbarCustomEvent],
    actions: [event: Event]
}>()

const thisInstance = getCurrentInstance();

const isSearch = computed(() => thisInstance?.vnode.props && Object.keys(thisInstance.vnode.props).includes('onSearch'))
const isActions = computed(() => thisInstance?.vnode.props && Object.keys(thisInstance.vnode.props).includes('onActions'))

</script>

<template>
    <IonHeader>
        <IonToolbar>
            <IonButtons slot="start" :collapse="true">
                <IonBackButton :defaultHref="defaultHref" />
            </IonButtons>
            <IonButtons slot="end" v-if="isActions">
                <IonButton @click="emit('actions', $event)">
                    <IonIcon slot="icon-only" :ios="ellipsisHorizontal" :md="ellipsisVertical"></IonIcon>
                </IonButton>
            </IonButtons>
            <IonTitle>{{ label }}</IonTitle>
        </IonToolbar>
        <slot></slot>
        <IonToolbar v-if="isSearch">
            <IonSearchbar @ionInput="emit('search', $event)" />
        </IonToolbar>
    </IonHeader>
</template>

<style scoped></style>