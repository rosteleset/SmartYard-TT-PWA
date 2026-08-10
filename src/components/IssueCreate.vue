<script setup lang="ts">

import { useTtStore } from "@/stores/ttStore";
import api from "@/utils/api";
import getCatalogsByWorkflow from "@/utils/getCatalogsByWorkflow";
import {
  availableIssueProjects,
  availableIssueWorkflows,
  issueTemplateModels,
} from "@/utils/issues";
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

const props = defineProps<{
  initialSubject?: string;
  initialDescription?: string;
}>();

const tt = useTtStore()
const { t } = useI18n()
const router = useRouter()

const availableProjects = computed(() =>
  availableIssueProjects(tt.meta?.projects, tt.meta?.workflows)
)
const project = ref<Project>()
const workflow = ref<string>()
const catalog = ref<string>()
const blocked = ref(false)
const models = ref<Models>({});
const workflowKeys = computed(() =>
  availableIssueWorkflows(project.value, tt.meta?.workflows)
)

const catalogs = computed(() => {
  const selectedWorkflow = workflow.value ? tt.meta?.workflows[workflow.value] : undefined;
  return selectedWorkflow ? getCatalogsByWorkflow(selectedWorkflow) : [];
})

watch(project, (nextProject, previousProject) => {
  if (nextProject?.projectId === previousProject?.projectId)
    return;
  workflow.value = undefined
  catalog.value = undefined
  models.value = {}
  blocked.value = false
})

watch(availableProjects, projects => {
  const current = projects.find(item => item.projectId === project.value?.projectId)
  if (current) {
    project.value = current
    return
  }

  project.value = projects.find(item => item.projectId === tt.project?.projectId) || projects[0]
}, { immediate: true })

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
      models.value = issueTemplateModels(res.template.fields, {
        subject: props.initialSubject || '',
        description: props.initialDescription || '',
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
        <IonButton @click="confirm" :strong="true" :disabled="!project || !workflow || !catalog">
          {{ $t('save') }}
        </IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent>
    <IonItem>
      <IonSelect interface="popover" label-placement="floating" :label="$t(`project`)" v-model="project"
        :disabled="blocked">
        <IonSelectOption v-for="variant in availableProjects" :value="variant" :key="variant.projectId">
          {{
            variant.project
          }}
        </IonSelectOption>
      </IonSelect>
    </IonItem>

    <IonItem>
      <IonSelect interface="popover" label-placement="floating" :label="$t(`workflow`)" v-model="workflow"
        :disabled="blocked">
        <IonSelectOption v-for="key in workflowKeys" :value="key" :key="key">
          {{
            tt.meta?.workflows[key]?.name || key
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
