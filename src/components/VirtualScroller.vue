<script lang="ts" setup generic="T">
import { IonContent, ScrollCustomEvent } from '@ionic/vue';
import { ComponentPublicInstance, computed, onMounted, ref } from 'vue';

const props = defineProps<{
  items: T[];
  itemKey: (item: T) => string | number;
}>();

const emit = defineEmits(['onIonScroll']);

// Refs for DOM elements and their properties
const scrollerRef = ref<InstanceType<typeof IonContent> | null>(null);
const headerRef = ref<HTMLElement | null>(null);
const footerRef = ref<HTMLElement | null>(null);
const itemRefs = ref<Record<number, HTMLElement>>({});

// Heights and scroll position
const itemHeights = ref<number[]>([]);
const cumulativeHeights = ref<number[]>([]);
const totalHeight = ref(0);
const scrollTop = ref(0);

// Utility function for binary search
function binarySearch(array: number[], value: number): number {
  let low = 0;
  let high = array.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (array[mid] < value) low = mid + 1;
    else if (array[mid] > value) high = mid - 1;
    else return mid;
  }
  return low;
}

// Computed average item height
const averageItemHeight = computed(() => {
  const heights = itemHeights.value.filter(h => h > 0);
  return heights.length > 0
    ? heights.reduce((sum, h) => sum + h, 0) / heights.length
    : 50; // Default height
});

// Computed list of visible items
const visibleItems = computed(() => {
  const scrollPosition = scrollTop.value;
  const viewportHeight = scrollerRef.value?.$el.clientHeight || 0;
  const totalItems = props.items.length;
  const buffer = 5;

  let startIdx = Math.max(0, binarySearch(cumulativeHeights.value, scrollPosition) - buffer);
  const visibleCount = Math.ceil(viewportHeight / averageItemHeight.value);
  const endIdx = Math.min(totalItems - 1, startIdx + visibleCount + buffer * 2);

  return props.items.slice(startIdx, endIdx + 1).map((data, index) => ({
    data,
    index: startIdx + index,
    key: props.itemKey(data),
  }));
});

// Function to get style for each item
const getItemStyle = (item: { index: number }) => {
  const top = cumulativeHeights.value[item.index - 1] || 0;
  return {
    position: 'absolute' as const,
    top: `${top}px`,
    left: '0',
    right: '0',
  };
};

// Update cumulative heights and total height
function updateHeights() {
  let total = 0;
  cumulativeHeights.value = props.items.map((_, i) => {
    const height = itemHeights.value[i] || averageItemHeight.value;
    total += height;
    return total;
  });
  totalHeight.value = total;
}

// Scroll event handler
const onIonScroll = (event: ScrollCustomEvent) => {
  scrollTop.value = event.detail.scrollTop;
  emit('onIonScroll', event)
};

// Reference setter for items
function setItemRef(el: Element | ComponentPublicInstance | null) {
  const element = el instanceof HTMLElement
    ? el
    : el && '$el' in el
      ? (el as ComponentPublicInstance).$el as HTMLElement
      : null;

  if (!element || element.dataset.index === undefined) return;

  const index = parseInt(element.dataset.index);
  itemRefs.value[index] = element;

  const resizeObserver = new ResizeObserver(() => {
    const height = element.offsetHeight;
    if (height > 0 && itemHeights.value[index] !== height) {
      itemHeights.value[index] = height;
      updateHeights();
      resizeObserver.disconnect();
    }
  });

  resizeObserver.observe(element);
}

// Initialize heights on mount
onMounted(() => {
  headerRef.value && (headerRef.value.offsetHeight);
  footerRef.value && (footerRef.value.offsetHeight);
  updateHeights();
});

</script>

<template>
  <IonContent ref="scrollerRef" scrollEvents @ionScroll="onIonScroll">
    <!-- Header Slot -->
    <div ref="headerRef">
      <slot name="header"></slot>
    </div>

    <!-- Virtualized List Container -->
    <div :style="{ position: 'relative', height: totalHeight + 'px' }">
      <div v-for="item in visibleItems" :key="item.key" :style="getItemStyle(item)" :data-index="item.index"
        :ref="setItemRef">
        <slot :item="item.data"></slot>
      </div>
    </div>

    <!-- Footer Slot -->
    <div ref="footerRef">
      <slot name="footer"></slot>
    </div>
  </IonContent>
</template>

<style scoped></style>
