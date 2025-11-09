// src/services/compraService.js
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/compras`; // ✅ tu backend de compras

// Obtener detalle de compra (por ID o número de compra)
export const obtenerDetalleCompra = async (codigo) => {
  try {
    const response = await axios.get(`${API_URL}/detalle/${codigo}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener detalle de compra:", error);
    throw error;
  }
};
