<script setup lang="ts">
import { IonPage, useIonRouter } from '@ionic/vue';
import { onMounted } from 'vue';

const router = useIonRouter()

onMounted(()=>{
  router.push('/issues')
})

</script>
<template>
  <IonPage>
  </IonPage>
</template>

<style scoped></style>