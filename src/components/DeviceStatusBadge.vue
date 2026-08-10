<script setup lang="ts">
import type { RbtStatus } from '@/types/operations';
import { statusColor } from '@/utils/operations';
import { IonBadge } from '@ionic/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ status?: RbtStatus }>();
const { t } = useI18n();
const label = computed(() => props.status?.status || t('operations.status.unknown'));
</script>

<template>
    <IonBadge :color="statusColor(status)">{{ label }}</IonBadge>
</template>
