<script setup lang="ts">

import { useTtStore } from "@/stores/ttStore";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { onMounted, ref } from "vue";
import IssueInput from "./IssueInput.vue";

type Models = Record<string, any>;

const { name, _fields, issue } = defineProps<{
  name: string,
  _fields: Record<string, any>,
  issue?: string | string[]
}>()

const tt = useTtStore()

const models = ref<Models>({});

const initFields = (labels: string[]) => {
  // Ищем индекс поля с ключом 'comment'
  const commentIndex = labels.findIndex((key) => key === 'comment' || key === 'optionalComment');

  // Если поле 'comment' найдено, добавляем поле 'commentPrivate' после него
  if (commentIndex !== -1) {
    labels.splice(commentIndex + 1, 0, 'commentPrivate'); // Вставляем после 'comment'
  }

  // Преобразуем массив обратно в объект и сохраняем его в fields.value
  models.value = Object.fromEntries(
    labels.map((value) => [value, value === 'commentPrivate' ? true : tt.issue?.issue[value] || '']))
}

const cancel = () => modalController.dismiss(null, 'cancel');

const confirm = () => {
  if (Array.isArray(issue))
    for (const id of issue)
      tt.doAction({ action: name, set: models.value, issueId: id })
        .then(() => modalController.dismiss(null, 'confirm'))
  else if (issue)
    tt.doAction({ action: name, set: models.value, issueId: issue })
      .then(() => modalController.dismiss(null, 'confirm'))
  else
    tt.doAction({ action: name, set: models.value })
      .then(() => modalController.dismiss(null, 'confirm'))
}

onMounted(
  () => {
    const id = issue ? (Array.isArray(issue) ? issue[0] : issue) : tt.issue ? tt.issue.issue.issueId : undefined;
    if (!id)
      return;

    if (_fields)
      initFields(Object.keys(_fields));
  });

</script>

<template>
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonButton color="medium" @click="cancel">{{ $t('cancel') }}</IonButton>
      </IonButtons>
      <IonTitle>{{ name }}</IonTitle>
      <IonButtons slot="end">
        <IonButton @click="confirm" :strong="true">{{ $t('save') }}</IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent v-if="models">
    <IssueInput v-for="key in Object.keys(models)" :key="key" :field="key" v-model="models[key]" :filter="_fields[key]" />
  </IonContent>
</template>

<style scoped></style>