import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Panel from "./pages/Panel";
import Perfil from "./pages/Perfil";
import Usuarios from "./pages/Usuarios";
import Login from "./pages/Login";
import Proveedores from "./pages/Proveedores";
import Clientes from "./pages/Cliente";
import Categorias from "./pages/Categorias";

import Compra from "./pages/Compra";
import CompraDetalle from "./pages/CompraDetalle";

import Productos from "./pages/Producto";
import Inventario from "./pages/Inventario";
import InvDashboard from "./pages/InvDashboard";

import Kardex from "./pages/Kardex";

import Venta from "./pages/Venta";
import VentaDetalle from "./pages/VentaDetalle";

import Caja from "./pages/Caja";
import RCaja from "./pages/RCaja";


import ReporteUsuarios from "./pages/Reportes/usuariosR";
import ReporteCategorias from "./pages/Reportes/categoriaR";
import ReporteProveedores from "./pages/Reportes/proveedorR";
import ReporteClientes from "./pages/Reportes/clienteR";

import Reportes from "./pages/Reportes";

import ReporteCompras from "./pages/RCompras";
import ReporteVentas from "./pages/RVentas";

import DevolucionCompra from "./pages/DevolucionCompra";
import DevolucionVenta from "./pages/DevolucionVenta";
import ReporteDevoluciones from "./pages/RDevoluciones";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "bootstrap-icons/font/bootstrap-icons.css";

// ✅ Componente Layout para rutas privadas (Dashboard)
const DashboardLayout = ({ children }) => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1">
        <Header />
        <div className="p-4 flex-grow-1">{children}</div>
        <Footer />
      </div>
    </div>
  );
};

// ✅ Componente para proteger rutas privadas
const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Ruta pública: Login */}
        <Route path="/login" element={<Login />} />

        {/* 🔹 Rutas privadas: Dashboard */}
        <Route
          path="/"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <h1>Bienvenido al Dashboard</h1>
                  <p>Ferretería La Estelita.</p>
                </DashboardLayout>
              }
            />
          }
        />
        <Route
          path="/inicio"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <Panel />
                </DashboardLayout>
              }
            />
          }
        />
        <Route
          path="/administracion/perfil"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <Perfil />
                </DashboardLayout>
              }
            />
          }
        />
        <Route
          path="/administracion/usuarios"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <Usuarios />
                </DashboardLayout>
              }
            />
          }
        />
        <Route
          path="/administracion/reportes"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <ReporteUsuarios />
                </DashboardLayout>
              }
            />
          }
        />
        <Route
          path="/inventario/productos"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <Productos />
                </DashboardLayout>
              }
            />
          }
        />
        <Route
          path="/inventario/precios"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <Inventario />
                </DashboardLayout>
              }
            />
          }
        />
         <Route
          path="/compras/categorias"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <Categorias />
                </DashboardLayout>
              }
            />
          }
        />
        <Route
          path="/compras/proveedores"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <Proveedores />
                </DashboardLayout>
              }
            />
          }
        />
        <Route
          path="/compras/productos"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <Compra />
                </DashboardLayout>
              }
            />
          }
        />
        <Route
          path="/ventas/clientes"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <Clientes />
                </DashboardLayout>
              }
            />
          }
        />
        <Route
          path="/ventas/registro"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <Venta />
                </DashboardLayout>
              }
            />
          }
        />
         <Route
          path="/reportes/categorias"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <ReporteCategorias />
                </DashboardLayout>
              }
            />
          }
        />
        <Route
          path="/reportes/proveedores"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <ReporteProveedores />
                </DashboardLayout>
              }
            />
          }
        />
        <Route
          path="/reportes/clientes"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <ReporteClientes />
                </DashboardLayout>
              }
            />
          }
        />
           <Route
          path="/reportes/rcompras"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <ReporteCompras />
                </DashboardLayout>
              }
            />
          }
        />
          <Route
          path="/reportes/rventas"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <ReporteVentas />
                </DashboardLayout>
              }
            />
          }
        />

         <Route
          path="/caja"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <Caja />
                </DashboardLayout>
              }
            />
          }
        />

        <Route
          path="/reportes/caja"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <RCaja />
                </DashboardLayout>
              }
            />
          }
        />

        <Route
          path="/inventario/kardex"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <Kardex />
                </DashboardLayout>
              }
            />
          }
        />

        <Route
          path="/inventario/dashboard"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <InvDashboard />
                </DashboardLayout>
              }
            />
          }
        />

        <Route
          path="/inventario/Ventasdetalle"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <VentaDetalle />
                </DashboardLayout>
              }
            />
          }
        />

        <Route
          path="/inventario/Comprasdetalle"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <CompraDetalle />
                </DashboardLayout>
              }
            />
          }
        />

        <Route
          path="/compras/DCompra"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <DevolucionCompra />
                </DashboardLayout>
              }
            />
          }
        />

        <Route
          path="/ventas/DVentas"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <DevolucionVenta />
                </DashboardLayout>
              }
            />
          }
        />

        <Route
          path="/reportes/rdevoluciones"
          element={
            <PrivateRoute
              element={
                <DashboardLayout>
                  <ReporteDevoluciones />
                </DashboardLayout>
              }
            />
          }
        />
      </Routes>
    </Router>
  );
}


export default App;
