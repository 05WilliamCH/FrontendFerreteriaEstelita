import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/reportedevoluciones`;

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
