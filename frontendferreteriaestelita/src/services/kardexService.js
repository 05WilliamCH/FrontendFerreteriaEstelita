import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/kardex`;

export const obtenerKardex = async (filtros) => {
  const response = await axios.get(API_URL, { params: filtros });
  return response.data;
};
