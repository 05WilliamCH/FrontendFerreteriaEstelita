import axios from "axios";

const API_URL = "http://localhost:3000/api/devoluciones"; // Ajusta según tu servidor

// =======================
// OBTENER TODAS LAS DEVOLUCIONES
// =======================
export const obtenerDevoluciones = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error al obtener devoluciones:", error);
    throw error;
  }
};

// =======================
// CREAR DEVOLUCIÓN
// =======================
export const crearDevolucion = async (devolucion) => {
  try {
    const response = await axios.post(API_URL, devolucion);
    return response.data;
  } catch (error) {
    console.error("Error al crear devolución:", error);
    throw error;
  }
};

// =======================
// ACTUALIZAR DEVOLUCIÓN
// =======================
export const actualizarDevolucion = async (id, devolucion) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, devolucion);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar devolución:", error);
    throw error;
  }
};

// =======================
// ELIMINAR DEVOLUCIÓN
// =======================
export const eliminarDevolucion = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar devolución:", error);
    throw error;
  }
};
