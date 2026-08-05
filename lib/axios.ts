import axios from "axios";
import Cookie from "js-cookie"
import {store} from "@/store/store"
import {logout} from "@/store/slices/authSlice"

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
})

api.interceptors.request.use((config) => {
    const token = Cookie.get("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookie.remove("token")
            store.dispatch(logout())
            window.location.href = "/login"
        }
        return Promise.reject(error)
    }
)

export default api;