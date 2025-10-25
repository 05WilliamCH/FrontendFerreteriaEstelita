import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [rol, setRol] = useState(localStorage.getItem("rol") || null);
  const [idusuario, setIdusuario] = useState(localStorage.getItem("idusuario") || null);
  const [nombre, setNombre] = useState(localStorage.getItem("nombre") || null);
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

    if (idusuario) localStorage.setItem("idusuario", idusuario);
    else localStorage.removeItem("idusuario");

    if (nombre) localStorage.setItem("nombre", nombre);
    else localStorage.removeItem("nombre");

  }, [token, rol, idusuario, nombre]);

  // ✅ Iniciar sesión
  const login = (newToken, newRol, newIdUsuario, newNombre) => {
    setToken(newToken);
    setRol(newRol);
     setIdusuario(newIdUsuario);
     setNombre(newNombre);
    navigate("/inicio"); // Redirige al dashboard
  };

  // ✅ Cerrar sesión
  const logout = () => {
    setToken(null);
    setRol(null);
    setIdusuario(null);
    setNombre(null);
    localStorage.clear();
    navigate("/login");
  };

  // ✅ Verificar si está autenticado
  const isAuthenticated = !!token;

  return { token, rol, idusuario, nombre, isAuthenticated, login, logout };
};

export default useAuth;
