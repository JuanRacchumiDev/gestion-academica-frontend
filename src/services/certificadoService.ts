import { Certificado } from "../interfaces/ICertificado"
import {
    getAll,
    getAllPaginate,
    getById,
    create,
    createModular,
    update,
    preview,
    generate,
    destroy,
    validar,
    downloadByCodigo
} from "../repositories/certificadoRepository"

export const getCertificados = async () => {
    const response = await getAll()

    return {
        ...response
    }
}

export const getCertificadosPaginate = async (
    page: number,
    limit: number,
    filters: {}
) => {
    console.log({ page })
    console.log({ limit })
    console.log({ filters })

    // Construir la cadena de query parameters
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value)
        )
    }).toString()

    console.log({ queryParams })

    const response = await getAllPaginate(queryParams)

    return {
        ...response
    }
}

export const getCertificadoById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

/**
 * Descarga el PDF del certificado por su ID
 */
export const downloadCertificado = async (id: number): Promise<void> => {
    const response = await generate(id);

    const { result, data, error, filename } = response

    if (!result || !data) {
        throw new Error(error || "No se pudo descargar el certificado.");
    }

    // Crear objeto Blob e iniciar la descarga en el navegador
    const blob = new Blob([data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // Limpieza de recursos de la ventana
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const viewCertificado = async (id: number) => {
    const response = await preview(id)

    return {
        ...response
    }
}

export const validarCertificadoByCodigo = async (codigoQR: string) => {
    const response = await validar(codigoQR)

    return {
        ...response
    }
}

export const downloadCertificadoByCodigo = async (codigo: string): Promise<void> => {
    const response = await downloadByCodigo(codigo);

    console.log({ response })

    const { result, data, error, filename } = response

    if (!result || !data) {
        throw new Error(error || "No se pudo descargar el certificado.");
    }

    const blob = new Blob([data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
}

export const createCertificado = async (payload: Certificado) => {
    const response = await create(payload)

    return {
        ...response
    }
}

export const createCertificadoModular = async (payload: Certificado) => {
    const response = await createModular(payload)

    return {
        ...response
    }
}

export const updateCertificado = async (id: number, payload: Certificado) => {
    const response = await update(id, payload)

    return {
        ...response
    }
}

export const deleteCertificado = async (id: number) => {
    const response = await destroy(id);

    console.log("---- response deleteCertificado service ----", { response });

    return {
        ...response,
    };
};