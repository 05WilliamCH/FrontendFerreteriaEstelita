import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null); // controla qué submenú está abierto
  const { rol, logout } = useAuth();

  const toggleSubmenu = (submenu) => {
    setOpenSubmenu(openSubmenu === submenu ? null : submenu);
  };

  return (
    <div
      className={`d-flex flex-column flex-shrink-0 p-3 bg-dark text-white min-vh-100 transition-all`}
      style={{
        width: isCollapsed ? "80px" : "250px",
        minHeight: "100%",
      }}
    >
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {!isCollapsed && <span className="fs-4">Ferreteria La Estelita</span>}
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i
            className={`bi ${
              isCollapsed ? "bi-arrow-right-square" : "bi-arrow-left-square"
            }`}
          ></i>
        </button>
      </div>

      <hr />

      {/* Menú */}
      <ul className="nav nav-pills flex-column mb-auto">
        {/* Inicio → Todos */}
        <li className="nav-item">
          <Link to="/inicio" className="nav-link text-white d-flex align-items-center">
            <i className="bi bi-house me-2"></i>
            {!isCollapsed && "Inicio"}
          </Link>
        </li>

        {/* Administración → Solo Administrador */}
        {rol === "1" && (
          <li>
            <button
              className="nav-link text-white dropdown-toggle d-flex align-items-center"
              onClick={() => toggleSubmenu("admin")}
              style={{
                border: "none",
                background: "transparent",
                width: "100%",
                textAlign: "left",
              }}
            >
              <i className="bi bi-gear me-2"></i>
              {!isCollapsed && "Administración"}
            </button>
            <div
              className={`collapse ${
                openSubmenu === "admin" && !isCollapsed ? "show" : ""
              }`}
            >
              <ul className="btn-toggle-nav list-unstyled fw-normal small">
                <li>
                  <Link to="/administracion/perfil" className="nav-link text-white ms-4">
                    Perfil
                  </Link>
                </li>
                <li>
                  <Link to="/administracion/usuarios" className="nav-link text-white ms-4">
                    Usuarios
                  </Link>
                </li>
                <li>
                  <Link to="/administracion/reportes" className="nav-link text-white ms-4">
                    Reporte Usuarios
                  </Link>
                </li>
              </ul>
            </div>
          </li>
        )}

        {/* Inventario → Administrador y Contador */}
        {(rol === "1" || rol === "2") && (
          <li>
            <button
              className="nav-link text-white dropdown-toggle d-flex align-items-center"
              onClick={() => toggleSubmenu("inventario")}
              style={{
                border: "none",
                background: "transparent",
                width: "100%",
                textAlign: "left",
              }}
            >
              <i className="bi bi-box-seam me-2"></i>
              {!isCollapsed && "Inventario"}
            </button>
            <div
              className={`collapse ${
                openSubmenu === "inventario" && !isCollapsed ? "show" : ""
              }`}
            >
              <ul className="btn-toggle-nav list-unstyled fw-normal small">
                <li>
                  <Link to="/inventario/productos" className="nav-link text-white ms-4">
                    Productos
                  </Link>
                </li>
                <li>
                  <Link to="/inventario/precios" className="nav-link text-white ms-4">
                    Agregar precios
                  </Link>
                </li>
              </ul>
            </div>
          </li>
        )}

        {/* Compras → Todos */}
        <li>
          <button
            className="nav-link text-white dropdown-toggle d-flex align-items-center"
            onClick={() => toggleSubmenu("compra")}
            style={{
              border: "none",
              background: "transparent",
              width: "100%",
              textAlign: "left",
            }}
          >
            <i className="bi bi-cart me-2"></i>
            {!isCollapsed && "Compra"}
          </button>
          <div
            className={`collapse ${
              openSubmenu === "compra" && !isCollapsed ? "show" : ""
            }`}
          >
            <ul className="btn-toggle-nav list-unstyled fw-normal small">
              <li>
                <Link to="/compras/categorias" className="nav-link text-white ms-4">
                  Categorías
                </Link>
              </li>
              <li>
                <Link to="/compras/proveedores" className="nav-link text-white ms-4">
                  Proveedores
                </Link>
              </li>
              <li>
                <Link to="/compras/productos" className="nav-link text-white ms-4">
                  Compra de Productos
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Ventas → Todos */}
        <li>
          <button
            className="nav-link text-white dropdown-toggle d-flex align-items-center"
            onClick={() => toggleSubmenu("venta")}
            style={{
              border: "none",
              background: "transparent",
              width: "100%",
              textAlign: "left",
            }}
          >
            <i className="bi bi-currency-dollar me-2"></i>
            {!isCollapsed && "Ventas"}
          </button>
          <div
            className={`collapse ${
              openSubmenu === "venta" && !isCollapsed ? "show" : ""
            }`}
          >
            <ul className="btn-toggle-nav list-unstyled fw-normal small">
              <li>
                <Link to="/ventas/clientes" className="nav-link text-white ms-4">
                  Clientes
                </Link>
              </li>
              <li>
                <Link to="/ventas/devoluciones" className="nav-link text-white ms-4">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link to="/ventas/registro" className="nav-link text-white ms-4">
                  Registro de Ventas
                </Link>
              </li>
            </ul>
          </div>
        </li>

        {/* Caja → Administrador y Contador */}
        {(rol === "1" || rol === "2") && (
          <li>
            <Link to="/caja" className="nav-link text-white d-flex align-items-center">
              <i className="bi bi-cash-stack me-2"></i>
              {!isCollapsed && "Caja"}
            </Link>
          </li>
        )}

        {/* Reportes → Solo Administrador */}
        {rol === "1" && (
          <li>
            <button
              className="nav-link text-white dropdown-toggle d-flex align-items-center"
              onClick={() => toggleSubmenu("reportes")}
              style={{
                border: "none",
                background: "transparent",
                width: "100%",
                textAlign: "left",
              }}
            >
              <i className="bi bi-file-earmark-text me-2"></i>
              {!isCollapsed && "Reportes"}
            </button>
            <div
              className={`collapse ${
                openSubmenu === "reportes" && !isCollapsed ? "show" : ""
              }`}
            >
              <ul className="btn-toggle-nav list-unstyled fw-normal small">
                <li>
                  <Link to="/reportes/categorias" className="nav-link text-white ms-4">
                    Reporte de Categorias
                  </Link>
                </li>
                <li>
                  <Link to="/reportes/proveedores" className="nav-link text-white ms-4">
                    Reporte de Proveedores
                  </Link>
                </li>
                <li>
                  <Link to="/reportes/clientes" className="nav-link text-white ms-4">
                    Reporte de Clientes
                  </Link>
                </li>
                <li>
                  <Link to="/reportes/utilidades" className="nav-link text-white ms-4">
                    Reporte de Productos
                  </Link>
                </li>
              </ul>
            </div>
          </li>
        )}

        {/* Footer → Logout */}
        <hr />
        <li>
          <button
            onClick={logout}
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            {!isCollapsed && "Cerrar sesión"}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
