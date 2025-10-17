import React, { useEffect, useState } from "react";
import { Button, Table, Form, Row, Col } from "react-bootstrap";
import { obtenerReporteVentasPorFechas } from "../services/reporteventaService";
import { exportarExcelVentas } from "../utils/excelHelperVentas";
import { exportarPDFVentas } from "../utils/pdfHelperVentas";
import logo from "../assets/ESTELITA.jpeg";

const RVentas = () => {
  const [reporte, setReporte] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const cargarReporte = async () => {
    try {
      const data = await obtenerReporteVentasPorFechas(fechaInicio, fechaFin);
      setReporte(data);
    } catch (error) {
      console.error("Error al obtener el reporte de ventas:", error);
    }
  };

  const calcularTotal = () => {
    return reporte
      .reduce((sum, venta) => sum + parseFloat(venta.total_venta || 0), 0)
      .toFixed(2);
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Reporte de Ventas</h2>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Control
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </Col>
        <Col md={6}>
          <Button variant="primary" className="me-2" onClick={cargarReporte}>
            Filtrar
          </Button>
          <Button
            variant="success"
            className="me-2"
            onClick={() => exportarExcelVentas(reporte,fechaInicio, fechaFin)}
          >
            Exportar Excel
          </Button>
          <Button
            variant="danger"
            onClick={() => exportarPDFVentas(reporte, logo, fechaInicio, fechaFin)}
          >
            Exportar PDF
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Usuario (Vendedor)</th>
            <th>Cantidad Productos</th>
            <th>Unidades Vendidas</th>
            <th>Total Q.</th>
          </tr>
        </thead>
        <tbody>
          {reporte.map((venta, index) => (
            <tr key={venta.idventa}>
              <td>{index + 1}</td>
              <td>{venta.fecha_venta}</td>
              <td>{venta.cliente}</td>
              <td>{venta.usuario}</td>
              <td>{venta.cantidad_productos}</td>
              <td>{venta.unidades_vendidas}</td>
              <td>Q. {parseFloat(venta.total_venta).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6} className="text-end fw-bold">Total General:</td>
            <td className="fw-bold">Q. {calcularTotal()}</td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
};

export default RVentas;
