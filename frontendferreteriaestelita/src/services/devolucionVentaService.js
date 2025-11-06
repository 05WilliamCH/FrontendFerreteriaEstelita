import axios from "axios";

const API_URL = "http://localhost:3000/api/devolucionventa";

// ============================
// DEVOLUCIÓN DE VENTA SERVICE
// ============================

// Crear devolución de venta
export const crearDevolucionVenta = (data) => {
  return axios.post(API_URL, data);
};

// Obtener todas las devoluciones de venta
export const obtenerDevolucionesVenta = () => {
  return axios.get(API_URL);
};

// Obtener una devolución por ID
export const obtenerDevolucionVentaPorId = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

// Obtener una venta por número de factura (para devolver productos)
export const obtenerVentaPorNumero = (numerofactura) => {
  return axios.get(`${API_URL}/numero/${numerofactura}`);
};
