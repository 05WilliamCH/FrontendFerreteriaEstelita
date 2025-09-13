import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReporteUsuariosPDF = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3000/api/usuarios", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("No autorizado o error en la API");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setUsuarios(data);
        else setUsuarios([]);
      })
      .catch((err) => console.error("Error al cargar usuarios:", err));
  }, []);

  // Filtrar usuarios
  const usuariosFiltrados = Array.isArray(usuarios)
    ? usuarios.filter((u) => {
        const cumpleEstado =
          filtroEstado === "todos"
            ? true
            : filtroEstado === "activos"
            ? u.estado === true
            : u.estado === false;

        const fechaUsuario = new Date(u.fechacreacion);
        const cumpleFecha =
          (!fechaInicio || fechaUsuario >= new Date(fechaInicio)) &&
          (!fechaFin || fechaUsuario <= new Date(fechaFin));

        return cumpleEstado && cumpleFecha;
      })
    : [];

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generar PDF
  const generarPDF = () => {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleString("es-ES");

    doc.setFontSize(16);
    doc.text("Reporte de Usuarios", 14, 20);
    doc.setFontSize(11);
    doc.text(`Fecha de reporte: ${fechaActual}`, 14, 28);

    const tableColumn = ["Nombre", "Correo", "Estado", "Fecha de Creación"];
    const tableRows = usuariosFiltrados.map((u) => [
      u.nombre || "-",
      u.email || "-",
      u.estado ? "Activo" : "Inactivo",
      formatearFecha(u.fechacreacion),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      didParseCell: (data) => {
        if (data.column.index === 2) {
          data.cell.styles.textColor = data.cell.raw === "Activo" ? [0, 128, 0] : [255, 0, 0];
        }
      },
      styles: { fontSize: 10 },
    });

    doc.save("reporte_usuarios.pdf");
  };

  // Imprimir tabla
  const imprimir = () => {
    window.print();
  };

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
            onChange={(e) => setFiltroEstado(e.target.value)}
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
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label>Fecha Fin:</label>
          <input
            type="date"
            className="form-control"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>

        <div className="col-md-3 d-flex align-items-end gap-2">
          <button className="btn btn-primary w-50" onClick={generarPDF}>
            Exportar PDF
          </button>
          <button className="btn btn-secondary w-50" onClick={imprimir}>
            Imprimir
          </button>
        </div>
      </div>

      {/* Tabla */}
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Estado</th>
            <th>Fecha de Creación</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.length > 0 ? (
            usuariosFiltrados.map((u) => (
              <tr key={u.idusuario}>
                <td>{u.nombre || "-"}</td>
                <td>{u.email || "-"}</td>
                <td className={u.estado ? "text-success" : "text-danger"}>
                  {u.estado ? "Activo" : "Inactivo"}
                </td>
                <td>{formatearFecha(u.fechacreacion)}</td>
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

export default ReporteUsuariosPDF;
