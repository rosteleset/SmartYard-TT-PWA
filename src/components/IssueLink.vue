<script setup lang="ts">
import {
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonSearchbar,
    IonList,
    IonRadioGroup,
    IonRadio,
    IonNote,
    modalController,
    alertController
} from "@ionic/vue";
import { ref, watch } from "vue";
import { useTtStore } from "@/stores/ttStore";
import { useI18n } from "vue-i18n";
import debounce from "@/utils/debounce";
import api from "@/utils/api";

const { issue } = defineProps<{ issue: { issueId: string; project: string } }>();

const tt = useTtStore();
const { t } = useI18n();

const selectedIssueId = ref<string | null>(null);
const issueOptions = ref<{ id: string; text: string }[]>([]);
const searchTerm = ref("");

const cancel = () => modalController.dismiss(null, "cancel");

const confirm = async () => {
    if (!selectedIssueId.value) return;

    try {
        await api.POST(`tt/link/${issue.issueId}`, { issueId: selectedIssueId.value });
        modalController.dismiss(null, "confirm");
    } catch (error: any) {
        alertController.create({
            header: t("something-went-wrong"),
            message: error.message,
            buttons: [t("ok")],
        }).then(alert => alert.present());
    }
};

const loadIssues = async (term = "") => {
    try {
        const data = await tt.getIssues({
            filter: "#issueSearch",
            skip: 0,
            limit: 100,
            search: term,
        });

        issueOptions.value = data.issues.map((item: any) => ({
            id: item.issueId,
            text: `[ ${item.issueId} ] ${item.subject}`,
        }));
    } catch (e: any) {
        alertController.create({
            header: t("something-went-wrong"),
            message: e.message,
            buttons: [t("ok")],
        }).then(alert => alert.present());
    }
};

const debouncedLoadIssues = debounce((val: string) => {
    console.log(val);

    loadIssues(val);
}, 500);

watch(searchTerm, (val) => {
    debouncedLoadIssues(val);
});

loadIssues();
</script>

<template>
    <IonHeader>
        <IonToolbar>
            <IonButtons slot="start">
                <IonButton color="medium" @click="cancel">{{ t('cancel') }}</IonButton>
            </IonButtons>
            <IonTitle>{{ t('saLink') }}</IonTitle>
            <IonButtons slot="end">
                <IonButton :disabled="!selectedIssueId" @click="confirm" :strong="true">
                    {{ t('save') }}
                </IonButton>
            </IonButtons>
        </IonToolbar>
    </IonHeader>

    <IonContent class="ion-padding">
        <IonSearchbar v-model="searchTerm" :placeholder="t('search')" :debounce="0" />

        <IonRadioGroup v-model="selectedIssueId">
            <IonList>
                <IonItem v-for="option in issueOptions" :key="option.id">
                    <IonLabel class="ion-text-wrap">
                        {{ option.text }}
                    </IonLabel>
                    <IonRadio slot="end" :value="option.id" />
                </IonItem>
            </IonList>
        </IonRadioGroup>

        <IonNote v-if="!issueOptions.length" class="ion-padding-top ion-text-center">
            {{ t('nothing-found') }}
        </IonNote>
    </IonContent>
</template>

<style scoped></style>
