import axios from "axios";

const API_URL = "http://localhost:3000/api/dashboard";

// Obtener totales (ventas, productos, categorías)
export const obtenerTotales = async () => {
  const [ventas, productos, categorias] = await Promise.all([
    axios.get(`${API_URL}/total-ventas`),
    axios.get(`${API_URL}/total-productos`),
    axios.get(`${API_URL}/total-categorias`),
  ]);
  return {
    totalVentas: ventas.data.totalventas,
    totalProductos: productos.data.totalproductos,
    totalCategorias: categorias.data.totalcategorias,
  };
};

// Obtener ventas por día (últimos 7 días)
export const obtenerVentasSemana = async () => {
  const res = await axios.get(`${API_URL}/ventas-semana`);
  return res.data;
};

// Obtener productos agrupados por categoría
export const obtenerProductosPorCategoria = async () => {
  const res = await axios.get(`${API_URL}/productos-categoria`);
  return res.data;
};
