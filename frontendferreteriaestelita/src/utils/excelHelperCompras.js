import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ========================
// EXPORTAR EXCEL
// ========================
export const exportarExcelCompras = (reporte) => {
  if (!reporte || reporte.length === 0) return;

  const wsData = reporte.map((compra, index) => ({
    "#": index + 1,
    Fecha: compra.fecha_compra,
    Usuario: compra.usuario,
    "Cantidad Productos": compra.cantidad_productos,
    "Unidades Compradas": compra.unidades_compradas,
    "Total Q.": parseFloat(compra.total_compra).toFixed(2),
  }));

  const ws = XLSX.utils.json_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte Compras");

  XLSX.writeFile(wb, `Reporte_Compras_${new Date().toLocaleDateString()}.xlsx`);
};
