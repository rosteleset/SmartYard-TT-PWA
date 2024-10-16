<script setup lang="ts">
import { PhotoData, useAttachments } from '@/hooks/useAttachments';
import { CameraSource } from '@capacitor/camera';
import { IonButton, IonButtons, IonIcon, IonItem, IonLabel, IonList } from "@ionic/vue";
import { trash } from "ionicons/icons";
import { ref } from 'vue';

const { field, label } = defineProps<{
    field: string,
    label?: string,
    multiple?: boolean
}>()

const items = defineModel<PhotoData[]>({ default: [] });

const { takePhoto } = useAttachments();

const fileInput = ref<HTMLInputElement | null>(null);

const selectFiles = () => {
    if (fileInput.value) {
        fileInput.value.click();
    }
};

const handleFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        for (const file of Array.from(target.files)) {
            const base64Data = await convertFileToBase64(file);
            const cleanBase64Data = base64Data.split(',')[1];
            if (Array.isArray(items.value))
                items.value.push({
                    name: file.name,
                    type: file.type,
                    body: cleanBase64Data,
                    size: file.size,
                    date: file.lastModified
                });
            else
                items.value = [{
                    name: file.name,
                    type: file.type,
                    body: cleanBase64Data,
                    size: file.size,
                    date: file.lastModified
                }];
        }
    }
};

const convertFileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
    });

const capturePhoto = async () => {
    try {
        const photo = await takePhoto(5 * 1024 * 1024, CameraSource.Camera); // Пример с ограничением 5MB
        items.value.push(photo.data);
    } catch (error) {
        console.error('Ошибка при получении фото:', error);
    }
};

const removeItem = (index: number) => {
    items.value.splice(index, 1);
};

</script>

<template>
    <div>
        <div class="ion-padding-vertical">
            <IonLabel>{{ label || field }}</IonLabel>
        </div>
        <IonButtons>
            <IonButton @click="selectFiles">{{ $t('select-files') }}</IonButton>
            <IonButton @click="capturePhoto">{{ $t('take-a-photo') }}</IonButton>
        </IonButtons>

        <input ref="fileInput" type="file" multiple @change="handleFileChange" style="display: none;" />

        <IonList>
            <IonItem v-for="(file, index) in items" :key="index">
                <IonLabel>
                    {{ file.name }}
                </IonLabel>
                <IonButton fill="clear" slot="end" @click="removeItem(index)">
                    <IonIcon :icon="trash" slot="icon-only"></IonIcon>
                </IonButton>
            </IonItem>
        </IonList>
    </div>
</template>

<style scoped></style>
