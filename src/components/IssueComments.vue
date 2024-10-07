<script setup lang="ts">
import { useTtStore } from "@/stores/ttStore";

const { issue } = defineProps<{
    issue: IssueData
}>()

const tt = useTtStore()

</script>

<template>

</template>

<style scoped></style>