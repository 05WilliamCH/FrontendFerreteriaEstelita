import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/categorias`; // Ajusta la URL según tu backend

// Obtener todas las categorías
export const obtenerCategorias = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Obtener categoría por ID
export const obtenerCategoria = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Crear nueva categoría
export const crearCategoria = async (categoria) => {
  const response = await axios.post(API_URL, categoria);
  return response.data;
};

// Actualizar categoría
export const actualizarCategoria = async (id, categoria) => {
  const response = await axios.put(`${API_URL}/${id}`, categoria);
  return response.data;
};

// Eliminar categoría
export const eliminarCategoria = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
