import { TableCell, TableRow } from "../ui/table";

export const TableSpinner = ({ colSpan }: { colSpan: number }) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-blue-500 font-medium">
            Cargando datos...
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
};
