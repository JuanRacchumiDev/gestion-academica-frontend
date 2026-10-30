import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const baseURL = import.meta.env.VITE_API_URL
const nestBaseURL = import.meta.env.VITE_NEST_API_URL

if (!baseURL) {
    console.warn('VITE_API_URL no está definida en las variables de entorno')
}

if (!nestBaseURL) {
    console.warn('VITE_NEST_API_URL no está definida en las variables de entorno')
}

// ----------------------------------------------------------------------
// Interceptores Reutilizables
// ----------------------------------------------------------------------

/**
 * Agrega el token de autenticación Bearer a las peticiones salientes.
 */
const authInterceptor = (config: InternalAxiosRequestConfig) => {
    try {
        const auth = JSON.parse(localStorage.getItem('auth') || '{}')
        const token = auth?.access_token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    } catch (err) {
        console.warn('Error al procesar el token de autenticación: ', err)
    }
    return config
}

/**
 * Maneja respuestas de error globalmente (ej. redirección por 401).
 */
const errorResponseInterceptor = (error: AxiosError) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')

    if (error.response && error.response.status === 401) {
        if (!isLoginRequest) {
            console.error('Sesión expirada (Error 401). Redirigiendo al login...')
            localStorage.removeItem('auth')
            window.location.href = '/login'
        }
    }
    return Promise.reject(error)
}

// ----------------------------------------------------------------------
// Instancias de Axios
// ----------------------------------------------------------------------

// 1. Cliente API Principal (Sist Académico)
export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 2. Cliente API Secundario (NestJS)
export const nestApiClient = axios.create({
    baseURL: nestBaseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

    // ----------------------------------------------------------------------
    // Asignación de Interceptores a Ambas Instancias
    // ----------------------------------------------------------------------

    ;[apiClient, nestApiClient].forEach((client) => {
        client.interceptors.request.use(
            authInterceptor,
            (error) => Promise.reject(error)
        )

        client.interceptors.response.use(
            (response) => response,
            errorResponseInterceptor
        )
    })

export default apiClient