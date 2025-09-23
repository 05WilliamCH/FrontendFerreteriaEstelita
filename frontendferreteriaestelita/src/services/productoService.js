import axios from "axios";

const API_URL = "http://localhost:3000/api/productos";

export const obtenerProductos = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const crearProducto = async (producto) => {
  const res = await axios.post(API_URL, producto);
  return res.data;
};

export const actualizarProducto = async (id, producto) => {
  const res = await axios.put(`${API_URL}/${id}`, producto);
  return res.data;
};

export const eliminarProducto = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
