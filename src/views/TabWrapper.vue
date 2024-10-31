<script setup lang="ts">
import { ref, provide } from 'vue';
import { IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, ScrollCustomEvent } from '@ionic/vue';
import { cog, list } from "ionicons/icons";

const tabs = [
    { name: "tt", icon: list },
    { name: "settings", icon: cog }
];

const defaultHeight = 56

// Переменная для управления высотой TabBar
const tabBarHeight = ref(defaultHeight); // Исходная высота IonTabBar
const lastScrollTop = ref(0);

const updateTabBarHeight = (height: number) => {
    tabBarHeight.value = height;
};
const handleScroll = (event: ScrollCustomEvent) => {

    const scrollTop = event.detail.scrollTop;
    const delta = scrollTop - lastScrollTop.value;

    // Обновляем высоту
    if (delta > 0 && tabBarHeight.value > 0) {
        // Прокрутка вниз
        tabBarHeight.value = Math.max(tabBarHeight.value - delta, 0);
    } else if (delta < 0 && tabBarHeight.value < defaultHeight) {
        // Прокрутка вверх
        tabBarHeight.value = Math.min(tabBarHeight.value - delta, defaultHeight);
    }

    updateTabBarHeight(tabBarHeight.value);
    lastScrollTop.value = scrollTop;
};

provide('tabBarHeight', tabBarHeight.value);
provide('updateTabBarHeight', updateTabBarHeight);
</script>

<template>
    <IonPage>
        <IonTabs>
            <IonRouterOutlet scrollEvents @ionScroll="handleScroll" />
            <IonTabBar :style="{ marginBottom: `${tabBarHeight - 56}px` }" slot="bottom" translucent>
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
IonTabBar {
    transition: height 0.3s ease;
    overflow: hidden;
}
</style>
