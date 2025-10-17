import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ========================
// EXPORTAR EXCEL DE VENTAS
// ========================
export const exportarExcelVentas = (reporte, fechaInicio, fechaFin) => {
  if (!reporte || reporte.length === 0) return;

  // Hoja de encabezado con rango de fechas
  const rangoFechas = [
    ["REPORTE DE VENTAS"],
    [`Desde: ${fechaInicio || "—"}`, `Hasta: ${fechaFin || "—"}`],
    [],
  ];

  const wsData = reporte.map((venta, index) => ({
    "#": index + 1,
    Fecha: venta.fecha_venta,
    Cliente: venta.cliente,
    "Usuario (Vendedor)": venta.usuario,
    "Cantidad Productos": venta.cantidad_productos,
    "Unidades Vendidas": venta.unidades_vendidas,
    "Total Q.": parseFloat(venta.total_venta).toFixed(2),
  }));

  const ws = XLSX.utils.json_to_sheet([]);
  XLSX.utils.sheet_add_aoa(ws, rangoFechas, { origin: "A1" });
  XLSX.utils.sheet_add_json(ws, wsData, { origin: "A4", skipHeader: false });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte Ventas");

  XLSX.writeFile(
    wb,
    `Reporte_Ventas_${new Date().toLocaleDateString().replace(/\//g, "-")}.xlsx`
  );
};
