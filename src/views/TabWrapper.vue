<script setup lang="ts">
import { ref, provide } from 'vue';
import { IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, ScrollCustomEvent } from '@ionic/vue';
import { cog, list } from "ionicons/icons";

const tabs = [
    { name: "tt", icon: list },
    { name: "settings", icon: cog }
];

const triggerPoint = 40

// Переменная для управления высотой TabBa
const showTabBar = ref(true)
let ticking = false;
const handleScroll = (event: ScrollCustomEvent) => {
    const { scrollTop, deltaY: delta } = event.detail;

    if (!ticking) {
        requestAnimationFrame(() => {
            if (delta > triggerPoint && showTabBar.value) {
                showTabBar.value = false;
            } else if ((delta < -triggerPoint || scrollTop === 0) && !showTabBar.value) {
                showTabBar.value = true;
            }
            ticking = false;
        });
        ticking = true;
    }
};

</script>

<template>
    <IonPage>
        <IonTabs>
            <IonRouterOutlet scrollEvents @ionScroll="handleScroll" />
            <IonTabBar :class="showTabBar ? 'visible' : 'hidden'" slot="bottom" translucent>
                <IonTabButton v-for="tab in tabs" :key="tab.name" :tab="tab.name" :href="`/${tab.name}`">
                    <IonIcon :icon="tab.icon" />
                    <IonLabel>{{ $t(`${tab.name}-page`) }}</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonPage>
</template>

<style scoped>
/* Плавное изменение высоты IonTabBar */
ion-tab-bar {
    transition: margin-bottom 0.3s ease;
    overflow: hidden;
}

ion-tab-bar.hidden {
    margin-bottom: -54px;
}
</style>
