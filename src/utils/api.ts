import { useAuthStore } from "@/stores/authStore"
import filterUndefined from "./filterUndefined";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';

const request = async (url: string, method?: string, body?: any) => {
    const auth = useAuthStore()

    const headers = new Headers({
        Accept: 'application/json',
        authorization: `Bearer ${auth.token}`
    })
    if (body !== undefined)
        headers.set('Content-Type', 'application/json')

    const res = await fetch(`${SERVER_URL}${url[0] === '/' ? '' : '/'}${url}`, {
        method: method,
        headers,
        body
    }).catch(() => {
        throw new Error(`Failed to fetch`);
    })
    const text = await res.text();
    let data: any = null;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        if (!res.ok)
            throw new Error(String(res.status));
        throw new Error('invalidResponse');
    }

    if (data && data.error && data.error === 'tokenNotFound') {
        await useAuthStore().logout()
    }
    if (data.error)
        throw new Error(data.error)
    if (!res.ok)
        throw new Error(String(res.status))
    else
        return data
}

const GET = (url: string, params?: Record<string, string | number | boolean | undefined>) => {
    const normalizedParams = params
        ? Object.fromEntries(Object.entries(filterUndefined(params)).map(([key, value]) => [key, String(value)]))
        : undefined;
    const _url = normalizedParams ? url + '?' + new URLSearchParams(normalizedParams) : url
    return request(_url)
}

const POST = async (url: string, params?: object) => {
    const body = params ? JSON.stringify(params) : undefined
    return await request(url, 'POST', body)
}

const PUT = async (url: string, params: object) => {
    return await request(url, 'PUT', JSON.stringify(params))
}

const DELETE = async (url: string, params?: object) => {
    return await request(url, 'DELETE', JSON.stringify(params))
}

export default { GET, POST, PUT, DELETE }
