import { AuthData } from '../interfaces/IAuth'

export const getAuthData = (): AuthData | null => {
    try {
        const auth = localStorage.getItem("auth");
        return auth ? (JSON.parse(auth) as AuthData) : null;
    } catch (e) {
        console.error("Failed to parse auth data from localStorage", e);
        return null;
    }
}