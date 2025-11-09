// ========================
// SERVICIO: REPORTE DE VENTAS
// ========================

const API_URL = `${import.meta.env.VITE_API_URL}/reporteventas`;

// Obtener todas las ventas (sin filtro)
export const obtenerReporteVentas = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al obtener el reporte de ventas");
    return await response.json();
  } catch (error) {
    console.error("❌ Error en obtenerReporteVentas:", error);
    return [];
  }
};

// Obtener ventas por rango de fechas
export const obtenerReporteVentasPorFechas = async (fechaInicio, fechaFin) => {
  try {
    const response = await fetch(
      `${API_URL}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    if (!response.ok)
      throw new Error("Error al obtener el reporte de ventas por fechas");
    return await response.json();
  } catch (error) {
    console.error("❌ Error en obtenerReporteVentasPorFechas:", error);
    return [];
  }
};
