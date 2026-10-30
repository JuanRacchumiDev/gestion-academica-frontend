import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { ModuloTable } from "./ModuloTable";

export const ModuloList = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Listado de módulos</h1>
        <div className="flex space-x-3">
          <Link
            to={"/modulo/nuevo"}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Nuevo módulo
          </Link>
        </div>
      </div>
      <Card className="shadow-lg border-gray-200">
        <CardContent>
          <ModuloTable />
        </CardContent>
      </Card>
    </div>
  );
};
