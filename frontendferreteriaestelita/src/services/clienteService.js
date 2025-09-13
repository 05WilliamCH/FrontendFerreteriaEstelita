import axios from "axios";

const API_URL = "http://localhost:3000/api/clientes";

// Obtener todos los clientes
export const obtenerClientes = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    throw error;
  }
};

// Crear un cliente
export const crearCliente = async (cliente) => {
  try {
    const res = await axios.post(API_URL, cliente);
    return res.data;
  } catch (error) {
    console.error("Error al crear cliente:", error);
    throw error;
  }
};

// Actualizar un cliente
export const actualizarCliente = async (id, cliente) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, cliente);
    return res.data;
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    throw error;
  }
};

// Eliminar un cliente
export const eliminarCliente = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    throw error;
  }
};
