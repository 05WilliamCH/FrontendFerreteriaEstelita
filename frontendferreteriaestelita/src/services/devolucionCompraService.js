import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/devolucioncompra`;

// ============================
// COMPRAS / DEVOLUCIONES SERVICE
// ============================

// Crear una nueva devolución de compra
export const crearDevolucionCompra = (data) => {
  return axios.post(API_URL, data);
};

// Obtener todas las devoluciones de compra
export const obtenerDevolucionesCompra = () => {
  return axios.get(API_URL);
};

// Obtener devolución de compra por ID
export const obtenerDevolucionCompraPorId = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

// Obtener productos de compra por numerocompra
export const obtenerCompraPorNumero = (numerocompra) => {
  return axios.get(`${API_URL}/productos/${numerocompra}`);
};