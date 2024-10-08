<script setup lang="ts">

import {
  alertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { useTtStore } from "@/stores/ttStore";
import { computed, ref, watch } from "vue";
import IssueCatalogSelect from "@/components/IssueCatalogSelect.vue";
import useIssueInput from "@/hooks/useIssueInput";
import { useRouter } from "vue-router";
import api from "@/utils/api";

// Определяем тип для модели
type Models = Record<string, any>;

const tt = useTtStore()
const inputs = useIssueInput()
const router = useRouter()

const project = ref(tt.project)
const workflow = ref<string>()
const catalog = ref<string>()

// const fields = ref()
const models = ref<Models>({});

const getComponentResult = computed(() => {
  return Object.keys(models.value).reduce<Record<string, {
    component: any;
    props: Record<string, any>;
  }>>((acc: any, key) => {
    acc[key] = inputs.getComponent(key, project.value);
    return acc;
  }, {});
});

const openCatalogSelect = async (e: Event) => {
  e.preventDefault()
  if (!workflow.value)
    return;
  const modal = await modalController.create({
    component: IssueCatalogSelect,
    componentProps: {
      workflow: tt.meta?.workflows[workflow.value],
      selectedItem: catalog.value,
    }
  });

  await modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'confirm') {
    catalog.value = data;
  }
}

const confirm = () => {
  return;
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
        header: 'Что то пошло не так',
        message: error.message,
        buttons: ['Ok'],
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
      const fields = res.template.fields
      Object.keys(res.template.fields).forEach(key => {
        models.value[fields[key]] = ''; // Инициализируем пустой строкой или другим значением по умолчанию
      });
    })
})

</script>

<template>
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonButton color="medium" @click="cancel">{{ $t('base.cancel') }}</IonButton>
      </IonButtons>
      <IonTitle>{{ $t('tt.createIssue') }}</IonTitle>
      <IonButtons slot="end">
        <IonButton @click="confirm" :strong="true">{{ $t('base.confirm') }}</IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent class="ion-padding">
    <IonSelect interface="popover" label-placement="floating" :label="$t(`tt.project`)" v-model="project">
      <IonSelectOption v-for="variant in tt.meta?.projects" :value="variant" :key="variant.projectId">
        {{
          variant.acronym
        }}
      </IonSelectOption>
    </IonSelect>

    <IonSelect interface="popover" label-placement="floating" :label="$t(`tt.workflow`)" v-model="workflow">
      <IonSelectOption v-for="key in project?.workflows" :value="key" :key="key">
        {{
          tt.meta?.workflows[key].name
        }}
      </IonSelectOption>
    </IonSelect>

    <IonInput readonly label-placement="floating" :label="$t(`tt.catalog`)" v-model="catalog"
      @click="openCatalogSelect">
    </IonInput>

    <component v-for="(model, key) in models" :key="key" :is="getComponentResult[key].component"
      v-bind="getComponentResult[key].props" v-model="models[key]" />

  </IonContent>
</template>

<style scoped></style>