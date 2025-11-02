import React, { useState } from "react";
import { obtenerDetalleCompra } from "../services/compraDetalleService";
import { Container, Card, Table, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { generarPDFCompra } from "../utils/pdfCompras"; // función para PDF de compras
import logoBase64 from "../assets/ESTELITA.jpeg";

const DetalleCompra = () => {
  const [codigo, setCodigo] = useState("");
  const [compra, setCompra] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [error, setError] = useState("");

  const buscarCompra = async () => {
    try {
      setError("");
      const data = await obtenerDetalleCompra(codigo);
      setCompra(data.compra);
      setDetalle(data.detalle);
    } catch (err) {
      setCompra(null);
      setDetalle([]);
      setError("No se encontró la compra o hubo un error al consultar.");
    }
  };

  const descargarPDF = () => {
    if (!compra) return;

    const datosCompra = {
      numeroCompra: compra.numerocompra,
      fecha: compra.fecha,
      total: compra.total,
      proveedor: {
        nombre: compra.proveedor,
        nit: compra.nit,
        direccion: compra.direccion,
        telefono: compra.telefono,
      },
      usuario: compra.usuario,
      productos: detalle.map(item => ({
        ...item,
        precio_compra: item.precio_compra,
      })),
    };

    generarPDFCompra(datosCompra, logoBase64);
  };

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow-lg border-0">
        <h4 className="mb-3 text-center">Buscar Detalle de Compra</h4>

        <Row className="mb-3">
          <Col md={9}>
            <Form.Control
              type="text"
              placeholder="Ingrese número de compra (ej: CMP-001)"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Button variant="primary" className="w-100" onClick={buscarCompra}>
              Buscar
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}

        {compra && (
          <>
            <Card className="p-3 mb-3">
              <h5>📄 Información de la Compra</h5>
              <Row>
                <Col><b>Compra:</b> {compra.numerocompra}</Col>
                <Col><b>Fecha:</b> {new Date(compra.fecha).toLocaleString()}</Col>
              </Row>
              <Row>
                <Col><b>Proveedor:</b> {compra.proveedor}</Col>
                <Col><b>NIT:</b> {compra.nit}</Col>
              </Row>
              <Row>
                <Col><b>Teléfono:</b> {compra.telefono}</Col>
                <Col><b>Dirección:</b> {compra.direccion}</Col>
              </Row>
              <Row>
                <Col><b>Atendido por:</b> {compra.usuario}</Col>
              </Row>
              <Row className="mt-2">
                <Col><b>Total:</b> Q{compra.total}</Col>
              </Row>
            </Card>

            <Button variant="success" className="w-100 mt-3" onClick={descargarPDF}>
                IMPRIMIR PDF
            </Button>

            <Card className="p-3 mt-3">
              <h5>🧾 Detalle de Productos</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Compra</th>
                    <th>Precio Unitario</th>
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
                      <td>Q{item.precio_compra}</td>
                      <td>Q{item.precio_unitario}</td>
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

export default DetalleCompra;
