import api from "@/utils/api";
import { defineStore } from "pinia";
import { onMounted, ref } from "vue";

export const useUsersStore = defineStore('users', () => {
    const users = ref<User[]>([])
    const groups = ref<Group[]>([])

    onMounted(() => {
        api.GET('accounts/users')
            .then(res => users.value = res.users)
        api.GET('accounts/groups')
            .then(res => groups.value = res.groups)
    })

    return { users, groups }
})