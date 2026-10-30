import { Link } from "react-router-dom";
import { Card, CardContent } from "../../ui/card";
import { BancoCuentaTable } from "./BancoCuentaTable";

export const BancoCuentaList = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Listado de cuentas de bancos
        </h1>
        <div className="flex space-x-3">
          <Link
            to="/mantenimiento/banco-cuenta/nuevo"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Nueva cuenta de banco
          </Link>
        </div>
      </div>
      <Card className="shadow-lg border-gray-200">
        <CardContent>
          <BancoCuentaTable />
        </CardContent>
      </Card>
    </div>
  );
};
