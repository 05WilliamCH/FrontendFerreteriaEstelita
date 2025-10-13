import React, { useEffect, useState } from "react";
import { Button, Table, Form, Row, Col } from "react-bootstrap";
import { obtenerReporteCompras } from "../services/reportecompraService";
import { exportarExcelCompras} from "../utils/excelHelperCompras";
import { exportarPDFCompras } from "../utils/pdfHelperCompras";
import logo from "../assets/ESTELITA.jpeg"; // o donde tengas tu logo

const RCompras = () => {
  const [reporte, setReporte] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const cargarReporte = async () => {
    try {
      const data = await obtenerReporteCompras(fechaInicio, fechaFin);
      setReporte(data);
    } catch (error) {
      console.error("Error al obtener el reporte de compras:", error);
    }
  };

  const calcularTotal = () => {
    return reporte
      .reduce((sum, compra) => sum + parseFloat(compra.total_compra || 0), 0)
      .toFixed(2);
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Reporte de Compras</h2>

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
            onClick={() => exportarExcelCompras(reporte)}
          >
            Exportar Excel
          </Button>
          <Button variant="danger" onClick={() => exportarPDFCompras(reporte, logo)}>
            Exportar PDF
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Cantidad Productos</th>
            <th>Unidades Compradas</th>
            <th>Total Q.</th>
          </tr>
        </thead>
        <tbody>
          {reporte.map((compra, index) => (
            <tr key={compra.idcompra}>
              <td>{index + 1}</td>
              <td>{compra.fecha_compra}</td> {/* CORREGIDO */}
              <td>{compra.usuario}</td>
              <td>{compra.cantidad_productos}</td>
              <td>{compra.unidades_compradas}</td>
              <td>Q. {parseFloat(compra.total_compra).toFixed(2)}</td> {/* CORREGIDO */}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} className="text-end fw-bold">Total General:</td>
            <td className="fw-bold">Q. {calcularTotal()}</td> {/* CORREGIDO */}
          </tr>
        </tfoot>
      </Table>
    </div>
  );
};

export default RCompras;
