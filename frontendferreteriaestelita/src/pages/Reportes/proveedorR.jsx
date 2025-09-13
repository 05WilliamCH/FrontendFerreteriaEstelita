import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button, Form } from "react-bootstrap";
import { obtenerProveedores } from "../services/proveedorService";

const ReporteProveedoresPDF = () => {
  const [proveedores, setProveedores] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      const data = await obtenerProveedores();
      setProveedores(data);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    }
  };

  const generarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Reporte de Proveedores", 14, 20);

    if (fechaInicio && fechaFin) {
      doc.setFontSize(12);
      doc.text(`Periodo: ${fechaInicio} a ${fechaFin}`, 14, 28);
    }

    const proveedoresFiltrados = proveedores.filter((prov) => {
      if (!fechaInicio || !fechaFin) return true;
      const fecha = new Date(prov.fechacreacion);
      return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin);
    });

    const data = proveedoresFiltrados.map((prov, index) => [
      index + 1,
      prov.nombre,
      prov.telefono || "-",
      prov.direccion || "-",
      prov.email || "-",
      prov.nit || "-",
      prov.fechacreacion
        ? new Date(prov.fechacreacion).toLocaleDateString("es-ES")
        : "-",
    ]);

    doc.autoTable({
      head: [["#", "Nombre", "Teléfono", "Dirección", "Email", "NIT", "Fecha Creación"]],
      body: data,
      startY: 35,
    });

    doc.save("Reporte_Proveedores.pdf");
  };

  return (
    <div className="container mt-4">
      <h2>Reporte de Proveedores</h2>

      <div className="d-flex gap-3 mb-3">
        <Form.Group>
          <Form.Label>Fecha Inicio</Form.Label>
          <Form.Control
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Fecha Fin</Form.Label>
          <Form.Control
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </Form.Group>
      </div>

      <Button variant="success" onClick={generarPDF}>
        <i className="bi bi-file-earmark-pdf"></i> Generar PDF
      </Button>
    </div>
  );
};

export default ReporteProveedoresPDF;
