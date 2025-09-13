// src/services/usuarioService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/usuarios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No se encontró token. Inicia sesión.");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

const handleAxiosError = (err) => {
  if (err.response && err.response.data) return Promise.reject(err.response.data);
  return Promise.reject({ error: err.message || "Error desconocido" });
};

// CRUD
export const obtenerUsuarios = async () => {
  try {
    const res = await axios.get(API_URL, getAuthHeaders());
    return res.data;
  } catch (err) {
    return handleAxiosError(err);
  }
};

export const crearUsuario = async (data) => {
  try {
    const res = await axios.post(API_URL, data, getAuthHeaders());
    return res.data;
  } catch (err) {
    return handleAxiosError(err);
  }
};

export const actualizarUsuario = async (id, data) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
    return res.data;
  } catch (err) {
    return handleAxiosError(err);
  }
};

export const eliminarUsuario = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return res.data;
  } catch (err) {
    return handleAxiosError(err);
  }
};

// LOGIN
export const loginUsuario = async (credenciales) => {
  try {
    const res = await axios.post(`${API_URL}/login`, credenciales);
    if (res.data.token) localStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err) {
    return handleAxiosError(err);
  }
};
