import React, { useEffect, useState } from "react";
import { Button, Table, Form, Row, Col, Spinner } from "react-bootstrap";
import { obtenerReporteCompras } from "../services/reportecompraService";
import { exportarExcelCompras } from "../utils/excelHelperCompras";
import { exportarPDFCompras } from "../utils/pdfHelperCompras";
import logo from "../assets/ESTELITA.jpeg"; // 🖼️ Asegúrate de que esta ruta sea correcta

const RCompras = () => {
  const [reporte, setReporte] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================
  // FUNCIÓN PARA CARGAR REPORTE
  // ==========================
  const cargarReporte = async () => {
    try {
      setLoading(true);
      const data = await obtenerReporteCompras(fechaInicio, fechaFin);
      setReporte(data || []);
    } catch (error) {
      console.error("❌ Error al obtener el reporte de compras:", error);
      setReporte([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // CALCULAR TOTAL GENERAL
  // ==========================
  const calcularTotal = () => {
    if (!Array.isArray(reporte)) return "0.00";
    return reporte
      .reduce((sum, compra) => sum + parseFloat(compra.total_compra || 0), 0)
      .toFixed(2);
  };

  // ==========================
  // CARGA INICIAL AUTOMÁTICA
  // ==========================
  useEffect(() => {
    cargarReporte();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3 text-center">Reporte de Compras</h2>

      {/* ==========================
          FILTROS DE FECHAS Y BOTONES
      =========================== */}
      <Row className="mb-4 align-items-center">
        <Col md={3}>
          <Form.Label>Fecha Inicio</Form.Label>
          <Form.Control
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Fecha Fin</Form.Label>
          <Form.Control
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </Col>
        <Col md={6} className="text-end mt-4">
          <Button variant="primary" className="me-2" onClick={cargarReporte}>
            Filtrar
          </Button>
          <Button
            variant="success"
            className="me-2"
            onClick={() => exportarExcelCompras(reporte)}
            disabled={!reporte.length}
          >
            Exportar Excel
          </Button>
          <Button
            variant="danger"
            onClick={() => exportarPDFCompras(reporte, logo, fechaInicio, fechaFin)}
            disabled={!reporte.length}
          >
            Exportar PDF
          </Button>
        </Col>
      </Row>

      {/* ==========================
          TABLA DE REPORTE
      =========================== */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Cargando reporte...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark text-center">
            <tr>
              <th>#</th>
              <th>No. Compra</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Usuario</th>
              <th>Cant. Productos</th>
              <th>Unidades Compradas</th>
              <th>Total (Q.)</th>
            </tr>
          </thead>
          <tbody>
            {reporte.length > 0 ? (
              reporte.map((compra, index) => (
                <tr key={compra.idcompra}>
                  <td>{index + 1}</td>
                  <td>{compra.numerocompra || "SIN COMPROBANTE"}</td>
                  <td>{compra.fecha_compra || "—"}</td>
                  <td>{compra.proveedor || "—"}</td>
                  <td>{compra.usuario || "—"}</td>
                  <td className="text-center">
                    {compra.cantidad_productos || 0}
                  </td>
                  <td className="text-center">
                    {compra.unidades_compradas || 0}
                  </td>
                  <td className="text-end">
                    Q. {parseFloat(compra.total_compra || 0).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted py-3">
                  No hay compras registradas en este rango de fechas.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={7} className="text-end fw-bold">
                Total General:
              </td>
              <td className="fw-bold text-end">Q. {calcularTotal()}</td>
            </tr>
          </tfoot>
        </Table>
      )}
    </div>
  );
};

export default RCompras;
