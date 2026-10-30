export interface IToastProps {
    type: "success" | "error" | "warning" | "info";
    message: string;
    onClose?: () => void
}