import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReporteClientesPDF = () => {
  const [clientes, setClientes] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3000/api/clientes", {
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
        if (Array.isArray(data)) setClientes(data);
        else setClientes([]);
      })
      .catch((err) => console.error("Error al cargar clientes:", err));
  }, []);

  // Filtrar por fecha
  const clientesFiltrados = Array.isArray(clientes)
    ? clientes.filter((c) => {
        const fechaCliente = c.fechacreacion
          ? new Date(c.fechacreacion)
          : null;

        const inicio = fechaInicio ? new Date(fechaInicio + "T00:00:00") : null;
        const fin = fechaFin ? new Date(fechaFin + "T23:59:59") : null;

        return (
          (!inicio || (fechaCliente && fechaCliente >= inicio)) &&
          (!fin || (fechaCliente && fechaCliente <= fin))
        );
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
    doc.text("Reporte de Clientes", 14, 20);
    doc.setFontSize(11);
    doc.text(`Fecha de reporte: ${fechaActual}`, 14, 28);

    const tableColumn = ["Nombre", "Teléfono", "Dirección", "Email", "NIT", "Fecha de Creación"];
    const tableRows = clientesFiltrados.map((c) => [
      c.nombre || "-",
      c.telefono || "-",
      c.direccion || "-",
      c.email || "-",
      c.nit || "-",
      formatearFecha(c.fechacreacion),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 10 },
    });

    doc.save("reporte_clientes.pdf");
  };

  const imprimir = () => {
    window.print();
  };

  return (
    <div className="container mt-5">
      <h2>Reporte de Clientes</h2>

      {/* Filtros de fecha */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label>Fecha Inicio:</label>
          <input
            type="date"
            className="form-control"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>

        <div className="col-md-4">
          <label>Fecha Fin:</label>
          <input
            type="date"
            className="form-control"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>

        <div className="col-md-4 d-flex align-items-end gap-2">
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
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Email</th>
            <th>NIT</th>
            <th>Fecha de Creación</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map((c) => (
              <tr key={c.idcliente}>
                <td>{c.nombre || "-"}</td>
                <td>{c.telefono || "-"}</td>
                <td>{c.direccion || "-"}</td>
                <td>{c.email || "-"}</td>
                <td>{c.nit || "-"}</td>
                <td>{formatearFecha(c.fechacreacion)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No hay clientes para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReporteClientesPDF;
