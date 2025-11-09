// src/services/invdashboard.js
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/inventario`; // Ajusta si tu backend usa otro puerto o prefijo

// Obtener resumen general del inventario y ventas
export const obtenerResumenInventario = async () => {
  try {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener resumen de inventario:", error);
    throw error;
  }
};
