import axios from "axios";

const API_URL = "http://localhost:3000/api/reportedevoluciones";

export const obtenerReporteDevoluciones = async (fechaInicio, fechaFin) => {
  try {
    const response = await axios.get(API_URL, {
      params: { fechaInicio, fechaFin },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener reporte de devoluciones:", error);
    throw error;
  }
};
