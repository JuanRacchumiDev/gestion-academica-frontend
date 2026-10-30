import { PersonaResponse } from "@/interfaces/IPersona";
import apiClient from "./apiClient";

export const getByApi = async (
    tipoDocumento: string,
    numeroDocumento: string,
    nombreGrupo: string
): Promise<PersonaResponse> => {
    try {
        const urlApi = `/personas/store-api`

        const payload = {
            tipo_documento: tipoDocumento,
            numero_documento: numeroDocumento,
            nombre_grupo: nombreGrupo
        }

        const response = await apiClient.post(urlApi, payload)

        console.log({ response })

        const { data: { success, message, data } } = response

        return {
            result: success,
            message,
            data
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}