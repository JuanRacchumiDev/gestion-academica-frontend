import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 transition-colors duration-500">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-blue-600">404</h1>
        <h2 className="text-3xl font-bold mt-4">Página no encontrada</h2>
        <p className="mt-2 text-lg text-slate-600">
          Lo sentimos, la página que estás buscando no existe.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block px-6 py-3 text-white font-semibold bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Ir al Dashboard
        </Link>
      </div>
    </div>
  );
};
