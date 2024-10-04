import { useAuthStore } from "@/stores/authStore"

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const request = async (url: string, method?: string, body?: any) => {
    const auth = useAuthStore()

    const headers = new Headers({
        authorization: `Bearer ${auth.token}`
    })
    const res = await fetch(`${SERVER_URL}${url[0] === '/' ? '' : '/'}${url}`, {
        method: method,
        headers,
        body
    }).catch(() => {
        throw new Error(`Failed to fetch`);
    })
    const data: any = await res.json();
    if (data && data.error && data.error === 'tokenNotFound') {
        useAuthStore().logout()
    }
    if (data.error)
        throw new Error(data.error)
    else
        return data
}

const GET = (url: string, params?: Record<string, string>) => {
    const _url = url + '?' + new URLSearchParams(params)
    return request(_url)
}

const POST = async (url: string, params?: object) => {
    const body = params ? JSON.stringify(params) : undefined
    return await request(url, 'POST', body)
}

export default { GET, POST }