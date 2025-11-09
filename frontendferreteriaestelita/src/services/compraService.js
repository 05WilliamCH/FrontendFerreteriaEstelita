import axios from "axios";

// ✅ Base URL dinámica según entorno
const API_URL = `${import.meta.env.VITE_API_URL}/compras`;

// Crear nueva compra
export const crearCompra = async (compra) => {
  const res = await axios.post(API_URL, compra);
  return res.data;
};

// Editar compra existente
export const editarCompra = async (idcompra, compra) => {
  const res = await axios.put(`${API_URL}/${idcompra}`, compra);
  return res.data;
};

// Obtener todas las compras
export const obtenerCompras = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
