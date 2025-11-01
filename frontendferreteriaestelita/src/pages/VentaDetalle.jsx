import React, { useState } from "react";
import { obtenerDetalleVenta } from "../services/ventaDetalleService";
import { Container, Card, Table, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { generarPDFVenta } from "../utils/pdfHelper";
import logoBase64 from "../assets/ESTELITA.jpeg";

const DetalleVenta = () => {
  const [codigo, setCodigo] = useState("");
  const [venta, setVenta] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [error, setError] = useState("");

  const buscarVenta = async () => {
    try {
      setError("");
      const data = await obtenerDetalleVenta(codigo);
      setVenta(data.venta);
      setDetalle(data.detalle);
    } catch (err) {
      setVenta(null);
      setDetalle([]);
      setError("No se encontró la venta o hubo un error al consultar.");
    }
  };

  const descargarPDF = () => {
  if (!venta) return;

  const datosVenta = {
    numeroFactura: venta.numerofactura,
    fecha: venta.fecha,
    total: venta.total,
    montorecibido: venta.montorecibido,
    vuelto: venta.vuelto,
    cliente: {
      nombre: venta.cliente,
      nit: venta.nit,
      direccion: venta.direccion,
      telefono: venta.telefono,
    },
    productos: detalle,
  };

   // Llamamos a la función de generación de PDF directamente para que lo descargue
  generarPDFVenta(datosVenta, logoBase64);
};

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow-lg border-0">
        <h4 className="mb-3 text-center">Buscar Detalle de Venta</h4>

        <Row className="mb-3">
          <Col md={9}>
            <Form.Control
              type="text"
              placeholder="Ingrese número de factura (ej: FAC-1761358341973)"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Button variant="primary" className="w-100" onClick={buscarVenta}>
              Buscar
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}

        {venta && (
          <>
            <Card className="p-3 mb-3">
              <h5>📄 Información de la Venta</h5>
              <Row>
                <Col><b>Factura:</b> {venta.numerofactura}</Col>
                <Col><b>Fecha:</b> {new Date(venta.fecha).toLocaleString()}</Col>
              </Row>
              <Row>
                <Col><b>Cliente:</b> {venta.cliente}</Col>
                <Col><b>NIT:</b> {venta.nit}</Col>
              </Row>
              <Row>
                <Col><b>Teléfono:</b> {venta.telefono}</Col>
                <Col><b>Dirección:</b> {venta.direccion}</Col>
              </Row>
              <Row>
                <Col><b>Atendido por:</b> {venta.usuario}</Col>
                <Col><b>ID Caja:</b> {venta.idcaja}</Col>
              </Row>
              <Row className="mt-2">
                <Col><b>Total:</b> Q{venta.total}</Col>
                <Col><b>Monto Recibido:</b> Q{venta.montorecibido}</Col>
                <Col><b>Vuelto:</b> Q{venta.vuelto}</Col>
              </Row>
            </Card>

            <Button variant="success" className="w-100 mt-3" onClick={descargarPDF}>
                IMPRIMIR PDF
            </Button>

            <Card className="p-3">
              <h5>🧾 Detalle de Productos</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Descuento</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.codigo}</td>
                      <td>{item.nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>Q{item.precio_venta}</td>
                      <td>Q{item.descuento}</td>
                      <td>Q{item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </>
        )}
      </Card>
    </Container>
  );
};

export default DetalleVenta;
