import apiClient, { nestApiClient } from "./apiClient";
import { Certificado, CertificadoResponse, CertificadoResponseGeneral } from "../interfaces/ICertificado"
import { padString } from "@/utils/stringUtils";

export const getAll = async (): Promise<CertificadoResponse> => {
    try {
        const urlApi = `/certificados`

        const response = await apiClient.get(urlApi)

        const { data: { result, data, message } } = response

        return {
            result,
            data,
            message
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getAllPaginate = async (queryParams: string): Promise<CertificadoResponse> => {
    try {
        const urlApi = `/certificados/paginate?${queryParams}`

        const response = await apiClient.get(urlApi)

        const { data: { result, data, message, pagination } } = response

        return {
            result,
            data: data.data,
            message,
            pagination
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getById = async (id: number): Promise<CertificadoResponse> => {
    try {
        const urlApi = `${'/certificados/'}${id}`

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

export const validar = async (codigoQR: string): Promise<CertificadoResponse> => {
    try {
        const urlApi = `/certificados/validar/${encodeURIComponent(codigoQR)}`;
        const response = await apiClient.get(urlApi);

        const { data: { result, data, message } } = response;

        return {
            result,
            data,
            message
        };
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || (error instanceof Error ? error.message : 'Error desconocido al validar');
        const status = error.response?.status || 500;
        console.error('Error al validar certificado:', errorMessage);
        return { result: false, data: null, error: errorMessage, status };
    }
};

/**
 * Descarga/obtiene el archivo Blob del PDF del certificado públicamente mediante su código.
 */
export const downloadByCodigo = async (codigo: string) => {
    try {
        const urlApi = `/certificados/descargar/${encodeURIComponent(codigo)}`;

        const response = await nestApiClient.get(urlApi, {
            responseType: 'blob'
        });

        const fileBlob = response.data;
        const contentDisposition = response.headers['content-disposition'];

        let filename = `certificado_${codigo}.pdf`;

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }

        return {
            result: true,
            data: fileBlob,
            filename,
            message: "Certificado descargado exitosamente"
        };
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al descargar el PDF';
        console.error('Error al descargar certificado por código:', errorMessage);
        return { result: false, data: null, error: errorMessage, status: 500 };
    }
};

export const create = async (payload: Certificado): Promise<CertificadoResponseGeneral> => {
    try {
        const response = await nestApiClient.post('/certificados', payload)

        const { data, status, statusText } = response

        return {
            data,
            status,
            statusText
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        return { data: [], status: 500, statusText: errorMessage }
    }
}

export const createModular = async (payload: Certificado): Promise<CertificadoResponse> => {
    try {
        const response = await apiClient.post('/certificados/modular', payload)

        const { data: { result, message, data } } = response

        return {
            result,
            message,
            data
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const update = async (id: number, payload: Certificado): Promise<CertificadoResponseGeneral> => {
    try {
        const urlApi = `/certificados/${id}`

        const response = await nestApiClient.patch(urlApi, payload)

        const { data, status, statusText } = response

        return {
            data,
            status,
            statusText
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        return { data: [], status: 500, statusText: errorMessage }
    }
}

export const preview = async (id: number) => {
    try {
        const urlApi = `${'/certificados/'}${id}/preview`

        window.open(urlApi, '_blank');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        // console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const generate = async (id: number) => {
    try {
        // const urlApi = `/certificados/${id}/download`
        const urlApi = `/certificados/${id}/pdf`;

        // const response = await apiClient.get(urlApi, {
        //     responseType: 'blob'
        // });

        const response = await nestApiClient.get(urlApi, {
            responseType: 'blob'
        });

        const fileBlob = response.data

        // El nombre del archivo puede venir en los headers, si el backend lo envía
        const contentDisposition = response.headers['content-disposition'];

        const idPadding = padString(4, id, 'left');

        let filename = `certificado_${idPadding}.pdf`

        if (contentDisposition) {
            // Intenta extraer el nombre del archivo del header 'Content-Disposition'
            const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1]
            }
        }

        return {
            result: true,
            data: fileBlob,
            filename,
            message: "Certificado generado exitosamente"
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        // console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const destroy = async (id: number): Promise<CertificadoResponse> => {
    try {
        const urlApi = `/certificados/${id}`;
        const response = await apiClient.delete(urlApi);

        const { data: { result, message, data } } = response;

        return {
            result,
            message,
            data,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Error desconocido al eliminar";
        console.error("errorMessage", errorMessage);
        return { result: false, data: [], error: errorMessage, status: 500 };
    }
};