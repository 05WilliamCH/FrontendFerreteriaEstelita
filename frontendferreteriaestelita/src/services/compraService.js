import axios from "axios";

// Crear nueva compra
export const crearCompra = async (compra) => {
  const res = await axios.post("/api/compras", compra);
  return res.data;
};

// Editar compra existente
export const editarCompra = async (idcompra, compra) => {
  const res = await axios.put(`/api/compras/${idcompra}`, compra);
  return res.data;
};

// Obtener todas las compras
export const obtenerCompras = async () => {
  const res = await axios.get("/api/compras");
  return res.data;
};
