import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import useAuth from "../hooks/useAuth";

const Header = () => {
  const { logout } = useAuth();
  const [nombreUsuario, setNombreUsuario] = useState("Usuario");
  const [rolUsuario, setRolUsuario] = useState("");

  useEffect(() => {
    const nombre = localStorage.getItem("nombre");
    const rol = localStorage.getItem("rol");

    if (nombre) setNombreUsuario(nombre);
    if (rol) {
      if (rol === "1" || rol === 1) setRolUsuario("Administrador");
      else if (rol === "2" || rol === 2) setRolUsuario("Contador");
      else setRolUsuario("Empleado");
    }
  }, []);

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
          {rolUsuario && <span className="text-muted ms-2">({rolUsuario})</span>}
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
