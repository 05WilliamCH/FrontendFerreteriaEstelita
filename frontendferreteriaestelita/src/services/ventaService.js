import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/ventas`;

// ========================
// CREAR NUEVA VENTA
// ========================
export const crearVenta = async (ventaData) => {
  // ventaData debe incluir:
  // idcliente, idusuario, fecha, productos (array), montorecibido, vuelto
  const res = await axios.post(API_URL, ventaData);
  return res.data;
};

// ========================
// OBTENER TODAS LAS VENTAS
// ========================
export const obtenerVentas = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// ========================
// OBTENER DETALLE DE UNA VENTA
// ========================
export const obtenerDetalleVenta = async (idventa) => {
  const res = await axios.get(`${API_URL}/${idventa}/detalle`);
  return res.data;
};
