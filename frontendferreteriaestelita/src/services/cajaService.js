import axios from "axios";

const API_URL = "http://localhost:3000/api/caja"; // Ajusta si tu backend usa otro puerto

// Abrir caja
export const abrirCaja = async (data) => {
  const res = await axios.post(`${API_URL}/abrir`, data);
  return res.data;
};

// Cerrar caja
export const cerrarCaja = async (data) => {
  const res = await axios.post(`${API_URL}/cerrar`, data);
  return res.data;
};

// Consultar estado actual
export const obtenerEstadoCaja = async () => {
  const res = await axios.get(`${API_URL}/estado`);
  return res.data;
};

// Sumar venta (se usa al registrar una venta)
export const sumarVentaCaja = async (monto) => {
  const res = await axios.post(`${API_URL}/sumarVenta`, { monto });
  return res.data;
};
