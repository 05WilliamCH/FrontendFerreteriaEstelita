import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [rol, setRol] = useState(localStorage.getItem("rol") || null);
  const navigate = useNavigate();

  // Guardar en localStorage cuando cambien
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }

    if (rol) {
      localStorage.setItem("rol", rol);
    } else {
      localStorage.removeItem("rol");
    }
  }, [token, rol]);

  // ✅ Iniciar sesión
  const login = (newToken, newRol) => {
    setToken(newToken);
    setRol(newRol);
    navigate("/inicio"); // Redirige al dashboard
  };

  // ✅ Cerrar sesión
  const logout = () => {
    setToken(null);
    setRol(null);
    localStorage.clear();
    navigate("/login");
  };

  // ✅ Verificar si está autenticado
  const isAuthenticated = !!token;

  return { token, rol, isAuthenticated, login, logout };
};

export default useAuth;
