<script setup lang="ts">
import { IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { business, cog, list, videocam } from "ionicons/icons";

const tabs = [
    { name: "tt", href: '/issues', icon: list },
    { name: "devices", href: '/devices', icon: videocam },
    { name: "houses", href: '/houses', icon: business },
    { name: "settings", href: '/settings', icon: cog }
];
</script>

<template>
    <IonPage>
        <IonTabs>
            <IonRouterOutlet />
            <IonTabBar slot="bottom" translucent>
                <IonTabButton v-for="tab in tabs" :key="tab.name" :tab="tab.name" :href="tab.href">
                    <IonIcon :icon="tab.icon" />
                    <IonLabel>{{ $t(`${tab.name}-page`) }}</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<style scoped></style>
