import axios from "axios";
import Cookie from "js-cookie"
import { toast } from "sonner"
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
    (response) => {
        const message = response.data?._message
        if (message) {
            toast.success(message)
        }
        return response
    },
    (error) => {
        if (error.response?.status === 401) {
            Cookie.remove("token")
            store.dispatch(logout())
            toast.error("Session expired. Please sign in again.")
            window.location.href = "/login"
            return Promise.reject(error)
        }

        const message = error.response?.data?._message ?? error.message ?? "Something went wrong"
        toast.error(message)
        return Promise.reject(error)
    }
)

export default api;