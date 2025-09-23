import axios from "axios";

export const crearCompra = async (compra) => {
  const res = await axios.post("/api/compras", compra);
  return res.data;
};
