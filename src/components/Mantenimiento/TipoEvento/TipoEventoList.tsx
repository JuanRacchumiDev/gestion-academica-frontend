import { Link } from "react-router-dom";
import { Card, CardContent } from "../../ui/card";
import { TipoEventoTable } from "./TipoEventoTable";

export const TipoEventoList = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Listado de tipo de eventos
        </h1>
        <div className="flex space-x-3">
          <Link
            to="/mantenimiento/tipo-evento/nuevo"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Nuevo tipo de evento
          </Link>
        </div>
      </div>
      <Card className="shadow-lg border-gray-200">
        <CardContent>
          <TipoEventoTable />
        </CardContent>
      </Card>
    </div>
  );
};
