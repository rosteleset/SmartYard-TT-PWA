<script setup lang="ts">

import useAlert from "@/hooks/useAlert";
import { useTtStore } from "@/stores/ttStore";
import api from "@/utils/api";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import IssueInput from "./IssueInput.vue";

type Models = Record<string, any>;

const { name, _fields, issue } = defineProps<{
  name: string,
  _fields: string[],
  issue?: string | string[]
}>()

const tt = useTtStore()
const { t } = useI18n()
const { presentAlert } = useAlert()

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
      initFields(_fields);
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
    <IssueInput v-for="key in Object.keys(models)" :key="key" :field="key" v-model="models[key]" />
  </IonContent>
</template>

<style scoped></style>