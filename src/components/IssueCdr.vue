<script setup lang="ts">
import useCdr from '@/hooks/useCdr';
import { IonItem, IonLabel, IonNote } from '@ionic/vue';
import { onMounted, ref, watch } from 'vue';
import dayjs from "dayjs";

const { issue } = defineProps<{
    issue: IssueData
}>()

const { cdr } = useCdr()

const calls = ref<any[]>([])

const load = () => {
    cdr(issue.issue)
        .then(r => calls.value = r.cdr)
}

onMounted(load)
watch(() => issue, load)

</script>

<template>
    <IonItem v-for="call in calls">
        <IonLabel>
            <div>{{ dayjs.unix(call.start).format('DD.MM.YYYY HH:mm') }}</div>
            <div><b>{{ call.src }} >>> {{ call.dst }}</b></div>
            <div class="wrapper">
                <audio controls :src="call.file" class="player" />
            </div>
        </IonLabel>
    </IonItem>
</template>

<style scoped>
.wrapper {
    margin-top: 1rem;
}

.player {
    width: 100%;
}
</style>