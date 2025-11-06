import React, { useState } from "react";
import {
  Button,
  Form,
  Row,
  Col,
  Table,
  Card,
  Spinner,
} from "react-bootstrap";
import {
  obtenerVentaPorNumero,
  crearDevolucionVenta,
} from "../services/devolucionVentaService";

const DevolucionVenta = () => {
  const [numeroFactura, setNumeroFactura] = useState("");
  const [venta, setVenta] = useState(null);
  const [productos, setProductos] = useState([]);
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(false);

  // ==========================
  // BUSCAR VENTA POR FACTURA
  // ==========================
  const buscarVenta = async () => {
    if (!numeroFactura.trim()) {
      alert("Ingrese el número de factura");
      return;
    }

    setCargando(true);
    try {
      const response = await obtenerVentaPorNumero(numeroFactura);
      const { venta, detalle } = response.data;

      if (!venta) {
        alert("Factura no encontrada");
        return;
      }

      // Agregamos campo cantidadDevolver por defecto 0
      const productosConCampo = detalle.map((p) => ({
        ...p,
        cantidadDevolver: 0,
      }));

      setVenta(venta);
      setProductos(productosConCampo);
    } catch (error) {
      console.error("Error al buscar la factura:", error);
      alert("Factura no encontrada o error en el servidor");
    } finally {
      setCargando(false);
    }
  };

  // ==========================
  // MANEJAR CAMBIO DE CANTIDAD DEVUELTA
  // ==========================
  const handleCantidadDevolver = (index, value) => {
    const nuevaLista = [...productos];
    const maxCantidad = nuevaLista[index].cantidad;

    let cantidad = parseInt(value, 10);
    if (isNaN(cantidad) || cantidad < 0) cantidad = 0;
    if (cantidad > maxCantidad) cantidad = maxCantidad;

    nuevaLista[index].cantidadDevolver = cantidad;
    setProductos(nuevaLista);
  };

  // ==========================
  // GUARDAR DEVOLUCIÓN
  // ==========================
  const guardarDevolucion = async () => {
    if (!venta) {
      alert("Primero busque una venta");
      return;
    }

    const productosDevolver = productos.filter(
      (p) => p.cantidadDevolver > 0
    );

    if (productosDevolver.length === 0) {
      alert("Debe ingresar al menos un producto a devolver");
      return;
    }

    if (!motivo.trim()) {
      alert("Debe indicar el motivo de la devolución");
      return;
    }

    const data = {
      idventa: venta.idventa,
      idusuario: 1, // Cambia por el ID real del usuario autenticado
      numerofactura: venta.numerofactura,
      motivo,
      productos: productosDevolver.map((p) => ({
        idproducto: p.idproducto,
        cantidad: p.cantidadDevolver,
        precio: p.precio_venta,
      })),
    };

    try {
      await crearDevolucionVenta(data);
      alert("✅ Devolución registrada correctamente");
      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar la devolución:", error);
      alert("❌ Error al registrar la devolución");
    }
  };

  // ==========================
  // LIMPIAR FORMULARIO
  // ==========================
  const limpiarFormulario = () => {
    setNumeroFactura("");
    setVenta(null);
    setProductos([]);
    setMotivo("");
  };

  // ==========================
  // RENDERIZADO
  // ==========================
  return (
    <Card className="p-4 shadow-lg border-0">
      <h3 className="text-center mb-4">Devolución de Venta</h3>

      {/* Buscar venta */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            className="form-control me-2"
            placeholder="Ingrese número de factura..."
            value={numeroFactura}
            onChange={(e) => setNumeroFactura(e.target.value)}
          />
        </Col>
        <Col md="auto">
          <Button variant="primary" onClick={buscarVenta} disabled={cargando}>
            {cargando ? (
              <>
                <Spinner size="sm" animation="border" /> Buscando...
              </>
            ) : (
              "Buscar Venta"
            )}
          </Button>
        </Col>
      </Row>

      {/* Detalles de venta */}
      {venta && (
        <>
          <div className="mb-3">
            <strong>Factura:</strong> {venta.numerofactura} <br />
            <strong>Cliente:</strong> {venta.cliente || "No registrado"} <br />
            <strong>Fecha:</strong>{" "}
            {new Date(venta.fecha).toLocaleDateString()} <br />
            <strong>Total:</strong> Q.{" "}
            {venta.totalventa
              ? venta.totalventa
              : productos.reduce(
                  (sum, p) => sum + p.cantidad * p.precio_venta,
                  0
                ).toFixed(2)}
          </div>


          <Table striped bordered hover responsive>
            <thead>
              <tr className="text-center">
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad Vendida</th>
                <th>Precio Unitario (Q.)</th>
                <th>Cantidad a Devolver</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod, index) => (
                <tr key={prod.idproducto}>
                  <td>{prod.codigo}</td>
                  <td>{prod.nombre}</td>
                  <td className="text-center">{prod.cantidad}</td>
                  <td className="text-center">{prod.precio_venta}</td>
                  <td className="text-center">
                    <Form.Control
                      type="number"
                      min="0"
                      max={prod.cantidad}
                      value={prod.cantidadDevolver}
                      onChange={(e) =>
                        handleCantidadDevolver(index, e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Form.Group className="mt-3">
            <Form.Label>Motivo de la devolución</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describa el motivo..."
            />
          </Form.Group>

          <div className="d-flex justify-content-end mt-3">
            <Button variant="success" onClick={guardarDevolucion}>
              Guardar Devolución
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default DevolucionVenta;
