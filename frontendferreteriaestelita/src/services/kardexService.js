import axios from "axios";

const API_URL = "http://localhost:3000/api/kardex";

export const obtenerKardex = async (filtros) => {
  const response = await axios.get(API_URL, { params: filtros });
  return response.data;
};
