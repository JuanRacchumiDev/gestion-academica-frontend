interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_PUBLIC_URL: string
    readonly VITE_NEST_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}