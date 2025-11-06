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
import Swal from "sweetalert2";
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
      Swal.fire("Atención", "Ingrese el número de factura.", "warning");
      return;
    }

    setCargando(true);
    try {
      const response = await obtenerVentaPorNumero(numeroFactura);
      const { venta, detalle } = response.data;

      if (!venta) {
        Swal.fire("No encontrado", "Factura no encontrada.", "error");
        return;
      }

      const productosConCampo = detalle.map((p) => ({
        ...p,
        cantidadDevolver: 0,
      }));

      setVenta(venta);
      setProductos(productosConCampo);
    } catch (error) {
      console.error("Error al buscar la factura:", error);
      Swal.fire("Error", "Factura no encontrada o error en el servidor.", "error");
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
      Swal.fire("Advertencia", "Primero busque una venta.", "warning");
      return;
    }

    const productosDevolver = productos.filter((p) => p.cantidadDevolver > 0);

    if (productosDevolver.length === 0) {
      Swal.fire("Atención", "Debe ingresar al menos un producto a devolver.", "warning");
      return;
    }

    if (!motivo.trim()) {
      Swal.fire("Atención", "Debe indicar el motivo de la devolución.", "warning");
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

    // Confirmación antes de registrar
    const confirmacion = await Swal.fire({
      title: "¿Registrar devolución?",
      text: "Se guardará la devolución de esta venta.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#198754",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await crearDevolucionVenta(data);

      Swal.fire({
        title: "Éxito",
        text: "Devolución registrada correctamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar la devolución:", error);
      Swal.fire("Error", "Error al registrar la devolución.", "error");
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

  return (
    <Card className="p-4 shadow-lg border-0">
      <h3 className="text-center mb-4">Devolución de Venta</h3>

      {/* Buscar venta */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
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
              : productos
                  .reduce((sum, p) => sum + p.cantidad * p.precio_venta, 0)
                  .toFixed(2)}
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
