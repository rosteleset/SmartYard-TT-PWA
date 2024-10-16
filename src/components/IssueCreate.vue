<script setup lang="ts">

import { useTtStore } from "@/stores/ttStore";
import api from "@/utils/api";
import getCatalogsByWorkflow from "@/utils/getCatalogsByWorkflow";
import {
  alertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import IssueInput from "./IssueInput.vue";

// Определяем тип для модели
type Models = Record<string, any>;

const tt = useTtStore()
const { t } = useI18n()
const router = useRouter()

const project = ref(tt.project || tt.meta?.projects[0])
const workflow = ref<string>()
const catalog = ref<string>()
const blocked = ref(false)
const models = ref<Models>({});

const catalogs = computed(() => tt.meta && workflow.value ? getCatalogsByWorkflow(tt.meta?.workflows[workflow.value]) : [])

// const fields = ref()

const confirm = () => {
  const issue = {
    project: project.value?.acronym,
    workflow: workflow.value,
    catalog: catalog.value,
    ...models.value
  }
  api.POST(`tt/issue`, { issue })
    .then(res => {
      modalController.dismiss(null, 'confirm')
      router.push({ name: 'issue', params: { id: res.id } })
    })
    .catch(error => {
      alertController.create({
        header: t('something-went-wrong'),
        message: error.message,
        buttons: [t('ok')],
      })
        .then((alert) => alert.present())
    })
}

const cancel = () => modalController.dismiss(null, 'cancel')

watch(catalog, () => {
  if (!workflow.value || !catalog.value)
    return;
  api.GET('tt/issueTemplate', {
    _id: workflow.value,
    catalog: catalog.value,
  })
    .then(res => {
      blocked.value = true
      const fields = res.template.fields
      Object.keys(res.template.fields).forEach(key => {
        if (!['project', 'workflow', 'catalog'].includes(fields[key]))
          models.value[fields[key]] = ''; // Инициализируем пустой строкой или другим значением по умолчанию
      });
    })
})

// onMounted(() => {
//   if (tt.meta?.customFields)
//     for (const cf of tt.meta.customFields) {
//       models.value['_cf_'+cf.field] = ''
//     }
// })
</script>

<template>
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonButton color="medium" @click="cancel">{{ $t('cancel') }}</IonButton>
      </IonButtons>
      <IonTitle>{{ $t('createIssue') }}</IonTitle>
      <IonButtons slot="end">
        <IonButton @click="confirm" :strong="true">{{ $t('save') }}</IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent>
    <IonItem>
      <IonSelect interface="popover" label-placement="floating" :label="$t(`project`)" v-model="project"
        :disabled="blocked">
        <IonSelectOption v-for="variant in tt.meta?.projects" :value="variant" :key="variant.projectId">
          {{
            variant.project
          }}
        </IonSelectOption>
      </IonSelect>
    </IonItem>

    <IonItem>
      <IonSelect interface="popover" label-placement="floating" :label="$t(`workflow`)" v-model="workflow"
        :disabled="blocked">
        <IonSelectOption v-for="key in project?.workflows" :value="key" :key="key">
          {{
            tt.meta?.workflows[key].name
          }}
        </IonSelectOption>
      </IonSelect>
    </IonItem>

    <IonItem>
      <IonSelect interface="popover" label-placement="floating" :label="$t(`catalog`)" v-model="catalog"
        :disabled="blocked">
        <IonSelectOption v-for="catalog in catalogs" :value="catalog.value" :key="catalog.value"
          :disabled="catalog.disabled">
          {{
            catalog.value
          }}
        </IonSelectOption>
      </IonSelect>
    </IonItem>

    <IssueInput v-for="key in Object.keys(models)" :key="key" :field="key" v-model="models[key]" :project="project" />
  </IonContent>
</template>

<style scoped></style>