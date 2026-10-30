import { Modulo, ModuloResponse } from "@/interfaces/IModulo";
import apiClient from "./apiClient";
import { AxiosRequestConfig } from "axios";

export interface ModuloFormInput extends Partial<Modulo> {
    plan?: File | string | null
}

export const getAllPaginate = async (queryParams: string): Promise<ModuloResponse> => {
    try {
        const urlApi = `/modulos/paginate?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: dataModulos } = response

        const { result, data, message } = dataModulos

        const listaItems = data.data

        const paginationInfo = {
            currentPage: data.current_page,
            limit: data.per_page,
            totalPages: data.last_page,
            totalItems: data.total,
            nextPage: data.next_page_url,
            previousPage: data.prev_page_url
        };

        return {
            result,
            data: listaItems,
            message,
            pagination: paginationInfo
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getById = async (id: number): Promise<ModuloResponse> => {
    try {
        const urlApi = `${'/modulos/'}${id}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        const { data: { result, message, data } } = response

        return {
            result,
            data,
            message
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getByPrograma = async (idPrograma: number) => {
    try {
        const urlApi = `${'/programas/'}${idPrograma}`

        console.log({ urlApi })

        console.log('---- response moduloRepository ----')

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: { result, message, data } } = response

        console.log({ data })

        const modulosAsociados = data?.detalle_modulos || [];

        return {
            result,
            data: modulosAsociados as Modulo[],
            message: message || "Módulos cargados correctamente"
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return {
            result: false,
            data: [],
            error: errorMessage,
            status: error.response.status || 500
        }
    }
}

export const createMultiple = async (
    idPrograma: number,
    modulos: ModuloFormInput[],
    config?: AxiosRequestConfig
): Promise<ModuloResponse> => {
    try {
        const urlApi = `${'/programas/'}${idPrograma}${'/actualizar-modulos'}`
        console.log({ urlApi })

        const formData = new FormData();

        modulos.forEach((modulo, index) => {
            if (modulo.id !== undefined && modulo.id !== null) {
                formData.append(`modulos[${index}][id]`, modulo.id.toString())
            }

            if (modulo.titulo) {
                formData.append(`modulos[${index}][titulo]`, modulo.titulo)
            }

            if (modulo.temario) {
                formData.append(`modulos[${index}][temario]`, modulo.temario)
            }

            if (modulo.orden !== undefined && modulo.orden !== null) {
                formData.append(`modulos[${index}][orden]`, modulo.orden.toString())
            }

            if (modulo.plan instanceof File) {
                formData.append(`modulos[${index}][plan]`, modulo.plan)
            } else if (typeof modulo.plan === 'string' && modulo.plan.trim() !== '') {
                formData.append(`modulos[${index}][plan]`, modulo.plan)
            }
        })

        console.log({ formData })

        const requestConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'multipart/form-data',
            },
        };

        const response = await apiClient.post(urlApi, formData, requestConfig)

        console.log('---- response moduloRepository ----')
        console.log({ response })

        const { data: { result, message, data } } = response

        return {
            result,
            message,
            data
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const updateMultiple = async (
    idPrograma: number,
    modulos: ModuloFormInput[],
    config?: AxiosRequestConfig
): Promise<ModuloResponse> => {
    return createMultiple(idPrograma, modulos, config);
}

export const create = async (payload: Modulo): Promise<ModuloResponse> => {
    try {
        const response = await apiClient.post('/modulos', payload)

        const { data: { result, message, data } } = response

        return {
            result,
            message,
            data
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}