<script setup lang="ts">
import IssuesFilters from '@/components/IssuesFilters.vue';
import { IonIcon, IonLabel, IonMenu, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { cog, list } from "ionicons/icons";

const tabs = [
    {
        name: "tt",
        icon: list
    },
    {
        name: "settings",
        icon: cog
    }
]
</script>

<template>
    <IonPage>
        <IonMenu content-id="issues" type="push">
            <IssuesFilters />
        </IonMenu>
        <IonTabs>
            <IonRouterOutlet />
            <IonTabBar slot="bottom">
                <IonTabButton v-for="tab in tabs" :key="tab.name" :tab="tab.name" :href="`/${tab.name}`">
                    <IonIcon :icon="tab.icon" />
                    <IonLabel>{{ tab.name }}</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<style scoped></style>