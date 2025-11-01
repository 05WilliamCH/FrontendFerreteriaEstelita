// src/services/ventaService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/ventas"; // ✅ tu backend correcto

// Obtener detalle de venta (por ID o número de factura)
export const obtenerDetalleVenta = async (codigo) => {
  try {
    const response = await axios.get(`${API_URL}/detalle/${codigo}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener detalle de venta:", error);
    throw error;
  }
};
