import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext.tsx";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <ToastProvider>
    <BrowserRouter basename="/">
      <App />
    </BrowserRouter>
  </ToastProvider>,
);
