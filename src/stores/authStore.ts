import { ref } from 'vue';
import { Preferences } from "@capacitor/preferences";
import { defineStore } from 'pinia';
import router from '@/router';
import api from '@/utils/api';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const token = ref<string | null>(null);
    const did = ref<string | null>(null);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const login = (login: string, password: string, rememberMe?: boolean) => {
        loading.value = true;
        error.value = null;

        api.POST('/authentication/login', { login, password, rememberMe, did: did.value })
            .then(response => {
                token.value = response.token;
                Preferences.set({ key: 'token', value: response.token });
                router.push('/');
                api.GET('/user/whoAmI')
                    .then(userResponse => user.value = userResponse.user);
            })
            .catch(_error => {
                error.value = _error.message || 'Login failed';
            })
            .finally(() => loading.value = false);
    };

    const logout = () => {
        user.value = null;
        token.value = null;
        Preferences.remove({ key: 'token' });
        router.push('/login');
    };

    // Восстановление токена из localStorage при инициализации приложения
    const initialize = async () => {
        const storedToken = (await Preferences.get({ key: 'token' })).value
        let storedDid = (await Preferences.get({ key: 'did' })).value;

        try {
            if (!storedDid)
                (storedDid = crypto.randomUUID())
                    && Preferences.set({ key: 'did', value: storedDid });

            did.value = storedDid;
        } catch (error) {
            console.warn(error);
        }


        if (storedToken) {
            token.value = storedToken;
            loading.value = true;
            api.GET('/user/whoAmI')
                .then(_user => user.value = _user.user)
                .catch(_error => error.value = _error.message)
                .finally(() => loading.value = false)
        }
    };

    return {
        user,
        token,
        loading,
        error,
        login,
        logout,
        initialize
    }
})
