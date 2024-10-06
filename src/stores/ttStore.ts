import { defineStore } from "pinia";
import { computed, ref } from "vue";
import api from "@/utils/api";

export const useTtStore = defineStore('tt', () => {
    // state
    const meta = ref<Meta>()

    // actions
    const load = async () => {
        return api.GET('tt/tt')
            .then(res => {
                meta.value = res.meta
            });
    }

    return {
        meta,
        load
    }
})