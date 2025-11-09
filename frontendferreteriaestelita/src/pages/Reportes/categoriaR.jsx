import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReporteCategoriasPDF = () => {
  const [categorias, setCategorias] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/categorias`, {
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
        if (Array.isArray(data)) setCategorias(data);
        else setCategorias([]);
      })
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

  // Filtrar por fecha solamente
const categoriasFiltradas = Array.isArray(categorias)
  ? categorias.filter((c) => {
      const fechaCategoria = new Date(c.fechacreacion);

      // Normalizar fechas
      const inicio = fechaInicio ? new Date(fechaInicio + "T00:00:00") : null;
      const fin = fechaFin ? new Date(fechaFin + "T23:59:59") : null;

      return (
        (!inicio || fechaCategoria >= inicio) &&
        (!fin || fechaCategoria <= fin)
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
    doc.text("Reporte de Categorías", 14, 20);
    doc.setFontSize(11);
    doc.text(`Fecha de reporte: ${fechaActual}`, 14, 28);

    const tableColumn = ["Nombre Categoría", "Fecha de Creación"];
    const tableRows = categoriasFiltradas.map((c) => [
      c.nombre || "-", // <-- usamos "nombre"
      formatearFecha(c.fechacreacion),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 10 },
    });

    doc.save("reporte_categorias.pdf");
  };

  // Imprimir tabla
  const imprimir = () => {
    window.print();
  };

  return (
    <div className="container mt-5">
      <h2>Reporte de Categorías</h2>

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
            <th>Nombre Categoría</th>
            <th>Fecha de Creación</th>
          </tr>
        </thead>
        <tbody>
          {categoriasFiltradas.length > 0 ? (
            categoriasFiltradas.map((c) => (
              <tr key={c.idcategoria}>
                <td>{c.nombre || "-"}</td>
                <td>{formatearFecha(c.fechacreacion)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-center">
                No hay categorías para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReporteCategoriasPDF;
