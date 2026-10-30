import { TIMEZONE_AMERICA_LIMA } from "@/params/constants"
import { parse, isValid } from "date-fns"
import { toDate, formatInTimeZone } from "date-fns-tz"

export const parseDate = (dateStr: string | null | undefined): Date => {
    if (!dateStr) return new Date()

    if (dateStr.includes("-") && dateStr.split("-")[0].length === 4) {
        return toDate(`${dateStr}T00:00:00`, { timeZone: TIMEZONE_AMERICA_LIMA })
    }

    const parsed = parse(dateStr, "dd-MM-yyyy", new Date());

    return isValid(parsed) ? parsed : new Date();
}

export const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "**/**/**"

    let date: Date

    if (dateString instanceof Date) {
        date = dateString
    } else {
        const cleanStr = dateString.trim()

        // 1. Caso: Format ISO o con tiempo
        if (cleanStr.includes("T") || /^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
            date = new Date(cleanStr.includes("T") ? cleanStr : `${cleanStr}T00:00:00`)
        }

        // 2. Caso: Formato del backend "dd-MM-yyyy"
        else if (/^\d{2}-\d{2}-\d{4}$/.test(cleanStr)) {
            date = parse(cleanStr, "dd-MM-yyyy", new Date())
        }

        // 3. Fallback genérico con Native Date
        else {
            date = new Date(cleanStr)
        }
    }

    // Si la fecha parseada es inválida
    if (!isValid(date) || isNaN(date.getTime())) {
        return "--/--/--";
    }

    return formatInTimeZone(date, TIMEZONE_AMERICA_LIMA, "dd/MM/yyyy");

    // if (typeof dateString === "string") {
    //     const cleanStr = dateString.includes("T") ? dateString : `${dateString}T00:00:00`
    //     date = toDate(cleanStr, { timeZone: TIMEZONE_AMERICA_LIMA })
    // } else {
    //     date = dateString
    // }

    // console.log('---- date in formatDate ----')
    // console.log({ date })

    // if (isNaN(date.getTime())) return "--/--/--";

    // return formatInTimeZone(date, TIMEZONE_AMERICA_LIMA, "dd/MM/yyyy");
}