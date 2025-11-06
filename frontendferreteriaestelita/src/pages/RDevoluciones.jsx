import React, { useState } from "react";
import { Button, Table, Form, Row, Col, Spinner } from "react-bootstrap";
import { obtenerReporteDevoluciones } from "../services/reporteDevolucionesService";
import { generarPDFDevoluciones } from "../utils/pdfDevoluciones";
import logo from "../assets/ESTELITA.jpeg"; // <-- si tienes el logo en tu carpeta assets

const ReporteDevoluciones = () => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [reporte, setReporte] = useState([]);
  const [cargando, setCargando] = useState(false);

  const handleBuscar = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("Por favor seleccione ambas fechas");
      return;
    }
    try {
      setCargando(true);
      const data = await obtenerReporteDevoluciones(fechaInicio, fechaFin);
      setReporte(data);
    } catch (error) {
      console.error("Error al obtener reporte:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleExportarPDF = async () => {
    if (reporte.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    // Convertir logo a Base64
    const toBase64 = (filePath) =>
      fetch(filePath)
        .then((res) => res.blob())
        .then(
          (blob) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            })
        );

    const logoBase64 = await toBase64(logo);
    generarPDFDevoluciones(reporte, { fechaInicio, fechaFin }, logoBase64);
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3 text-center">Reporte de Devoluciones</h3>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Fecha Inicio</Form.Label>
            <Form.Control
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Fecha Fin</Form.Label>
            <Form.Control
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <Button variant="primary" onClick={handleBuscar} className="me-2">
            {cargando ? <Spinner size="sm" /> : "Buscar"}
          </Button>
          <Button variant="danger" onClick={handleExportarPDF}>
            Exportar PDF
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Tipo</th>
            <th>Número</th>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Cliente / Proveedor</th>
            <th>Motivo</th>
            <th>Total (Q)</th>
          </tr>
        </thead>
        <tbody>
          {reporte.length > 0 ? (
            reporte.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{r.tipo}</td>
                <td>{r.numero}</td>
                <td>{new Date(r.fecha).toLocaleString()}</td>
                <td>{r.usuario}</td>
                <td>{r.proveedor_cliente}</td>
                <td>{r.motivo}</td>
                <td>{Number(r.total).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No hay registros para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ReporteDevoluciones;
