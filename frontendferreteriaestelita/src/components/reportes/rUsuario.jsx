import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ReporteUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("todos"); // todos, activos, inactivos
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    // Aquí llamas a tu API para obtener usuarios
    fetch("http://localhost:3000/api/usuarios") // Ajusta tu URL
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error(err));
  }, []);

  // Filtrar usuarios por estado y fecha
  const usuariosFiltrados = usuarios.filter(u => {
    const cumpleEstado =
      filtroEstado === "todos"
        ? true
        : filtroEstado === "activos"
        ? u.estado === "activo"
        : u.estado === "inactivo";

    const fechaUsuario = new Date(u.fechaCreacion); // Suponiendo que tienes campo fechaCreacion
    const cumpleFecha =
      (!fechaInicio || fechaUsuario >= new Date(fechaInicio)) &&
      (!fechaFin || fechaUsuario <= new Date(fechaFin));

    return cumpleEstado && cumpleFecha;
  });

  return (
    <div className="container mt-5">
      <h2>Reporte de Usuarios</h2>

      {/* Filtros */}
      <div className="row mb-3">
        <div className="col-md-3">
          <label>Estado:</label>
          <select
            className="form-select"
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>

        <div className="col-md-3">
          <label>Fecha Inicio:</label>
          <input
            type="date"
            className="form-control"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label>Fecha Fin:</label>
          <input
            type="date"
            className="form-control"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de usuarios */}
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Fecha de Creación</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.length > 0 ? (
            usuariosFiltrados.map(u => (
              <tr key={u.idusuario}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.estado}</td>
                <td>{new Date(u.fechaCreacion).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No hay usuarios para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReporteUsuarios;
