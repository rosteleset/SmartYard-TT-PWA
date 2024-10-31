import { ScrollCustomEvent } from "@ionic/vue";
import { inject, ref } from "vue";

const defaultHandler = (height: number) => { }
const defaultHeight = 56

const useTabBarVisibility = () => {
    const updateTabBarHeight: (height: number) => void = inject<(height: number) => void>('updateTabBarHeight') || defaultHandler;
    const lastScrollTop = ref(0);
    const currentHeight = ref<number>(inject('tabBarHeight') || defaultHeight); // Начальная высота

    const handleScroll = (event: ScrollCustomEvent) => {
        const scrollTop = event.detail.scrollTop;
        const delta = scrollTop - lastScrollTop.value;

        // Обновляем высоту
        if (delta > 0 && currentHeight.value > 0) {
            // Прокрутка вниз
            currentHeight.value = Math.max(currentHeight.value - delta, 0);
        } else if (delta < 0 && currentHeight.value < defaultHeight) {
            // Прокрутка вверх
            currentHeight.value = Math.min(currentHeight.value - delta, defaultHeight);
        }

        updateTabBarHeight(currentHeight.value);
        lastScrollTop.value = scrollTop;
    };

    return { handleScroll }
}

export default useTabBarVisibility