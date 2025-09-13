import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import useAuth from "../hooks/useAuth";

const Header = () => {
  const { logout, token } = useAuth();
  const [nombreUsuario, setNombreUsuario] = useState("Usuario");
  const [rolUsuario, setRolUsuario] = useState("");

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);

      if (decoded) {
        setNombreUsuario(decoded.nombre || "Usuario");
        setRolUsuario(decoded.rol || ""); // 👈 Aquí tomamos el rol
      }
    }
  }, [token]);

  const decodeToken = (token) => {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (err) {
      console.error("Error al decodificar token:", err);
      return null;
    }
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <span className="navbar-brand mb-0 h1">Dashboard</span>
      <div className="dropdown">
        <button
          className="btn btn-dark dropdown-toggle d-flex align-items-center"
          type="button"
          id="dropdownUser"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="bi bi-person-circle me-2"></i>
          {nombreUsuario}{" "}
          {rolUsuario && (
            <span className="text-muted ms-2">({rolUsuario})</span>
          )}
        </button>
        <ul
          className="dropdown-menu dropdown-menu-end"
          aria-labelledby="dropdownUser"
        >
          <li>
            <a className="dropdown-item" href="/administracion/perfil">
              <i className="bi bi-person me-2"></i> Perfil
            </a>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <button className="dropdown-item text-danger" onClick={logout}>
              <i className="bi bi-box-arrow-right me-2"></i> Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
