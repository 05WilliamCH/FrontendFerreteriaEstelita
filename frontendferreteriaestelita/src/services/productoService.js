import axios from "axios";

const API_URL = "http://localhost:3000/api/productos";

// =====================
// OBTENER TODOS LOS PRODUCTOS
// =====================
export const obtenerProductos = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    return [];
  }
};

// =====================
// OBTENER PRODUCTO POR CÓDIGO (AUTOCOMPLETADO)
// =====================
export const obtenerProductoPorCodigo = async (codigo) => {
  try {
    const res = await axios.get(`${API_URL}/codigo/${codigo}`);
    return res.data; // devuelve un solo producto o null
  } catch (error) {
    console.error("Error obteniendo producto por código:", error);
    return null;
  }
};

// =====================
// CREAR PRODUCTO
// =====================
export const crearProducto = async (producto) => {
  try {
    const res = await axios.post(API_URL, producto);
    return res.data;
  } catch (error) {
    console.error("Error creando producto:", error);
    return null;
  }
};

// =====================
// ACTUALIZAR PRODUCTO
// =====================
export const actualizarProducto = async (id, producto) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, producto);
    return res.data;
  } catch (error) {
    console.error("Error actualizando producto:", error);
    return null;
  }
};

// =====================
// ELIMINAR PRODUCTO
// =====================
export const eliminarProducto = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error eliminando producto:", error);
    return null;
  }
};
