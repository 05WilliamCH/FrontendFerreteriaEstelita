import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/reportecompras`; // ya apunta a tu backend en 3000

export const obtenerReporteCompras = async (fechaInicio = "", fechaFin = "") => {
  try {
    const params = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    const { data } = await axios.get(API_URL, { params });
    return data;
  } catch (error) {
    console.error("Error al obtener el reporte de compras:", error);
    throw error;
  }
};
