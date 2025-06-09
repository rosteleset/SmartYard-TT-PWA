<script setup lang="ts">
import { IonPage, useIonRouter } from '@ionic/vue';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter()
const route = useRoute()

onMounted(() => {
  const hash = route.hash.substring(1)
  const params = new URLSearchParams(hash)
  const issueId = params.get('issue')
  const filter = params.get('filter')
  const search = params.get('search')
  const skip = params.get('skip')

  if (issueId) {
    router.replace({ name: 'issue', params: { id: issueId } })
  } else if (filter || search) {
    router.replace({ name: 'issues', query: { filter, search, skip } })
  } else {
    router.replace({ name: 'issues' }) // по умолчанию
  }
})

</script>
<template>
  <IonPage>
  </IonPage>
</template>

<style scoped></style>