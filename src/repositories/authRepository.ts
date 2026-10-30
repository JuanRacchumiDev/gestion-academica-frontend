import { TAuthResponse } from "../types/TAuthResponse";
import apiClient from "./apiClient";

export const login = async (email: string, password: string): Promise<TAuthResponse> => {
    try {
        const credenciales: { email: string, password: string } = {
            email,
            password
        }

        // console.log({ credenciales })

        const response = await apiClient.post('/auth/login', credenciales)

        // console.log('---- response authRepository ----')
        // console.log({ response })

        const { data: { access_token, result, message, usuario, error }, status } = response

        if (status === 200 && result) {
            localStorage.setItem('auth', JSON.stringify({ access_token, usuario }));

            return {
                result,
                message: message || "Sesión iniciada con éxito",
                error,
                status,
                data: usuario
            };
        }

        return {
            result,
            message: message || "Error al iniciar sesión",
            status,
            data: null

        }

    } catch (error) {
        // console.log('Error capturado en el repositorio:', error);

        if (error.response && error.response.data) {
            const { message, error: resError, result } = error.response.data;
            return {
                result: result ?? false,
                message: message || resError || "Credenciales inválidas",
                status: error.response.status,
                data: null
            };
        }

        const errorMessage = error instanceof Error ? error.message : 'Error de red o conexión';
        // console.log('errorMessage', errorMessage)
        return {
            result: false,
            message: errorMessage,
            error: errorMessage,
            status: 500,
            data: null
        }
    }
}

export const logout = async (id: number): Promise<TAuthResponse> => {
    try {
        const response = await apiClient.post('/auth/logout', { id })

        // console.log('logout authRepository')
        // console.log({ response })

        const { data: { result, status, message, error } } = response

        if (result && status === 200) {
            localStorage.removeItem('auth')

            return {
                result,
                status,
                message,
                error
            }
        }

        return {
            result,
            status,
            message: message || "Error al cerrar sesión",
            error
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error de inicio de sesión'
        // console.log('errorMessage', errorMessage)
        return { result: false, error: errorMessage, status: 500 }
    }
}