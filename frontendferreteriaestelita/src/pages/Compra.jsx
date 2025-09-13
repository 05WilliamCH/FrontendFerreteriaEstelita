import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Table, Card, Modal } from "react-bootstrap";
import axios from "axios";

const Compras = () => {
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [compra, setCompra] = useState({
    idprov: "",
    nit: "",
    telefono: "",
    direccion: "",
    correo: "",
    fecha: "",
    detalles: [],
    total: 0,
  });

  const [detalle, setDetalle] = useState({
    idcategoria: "",
    codigo: "",
    nombre: "",
    descripcion: "",
    cantidad: "",
    precio: "",
    descuento: "",
  });

  // Estado del modal para nuevo proveedor
  const [showModalProveedor, setShowModalProveedor] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    email: "",
    nit: "",
  });

  // ====== CARGA INICIAL ======
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCat = await axios.get("http://localhost:3000/api/categorias");
        setCategorias(resCat.data);

        const resProv = await axios.get("http://localhost:3000/api/proveedores");
        setProveedores(resProv.data);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };
    fetchData();
  }, []);

  // ====== INPUT GENERAL ======
  const handleCompraChange = (e) => {
    setCompra({ ...compra, [e.target.name]: e.target.value });
  };

  const handleDetalleChange = (e) => {
    setDetalle({ ...detalle, [e.target.name]: e.target.value });
  };

  // ====== AGREGAR DETALLE ======
  const agregarDetalle = () => {
    if (!detalle.idcategoria || !detalle.nombre || !detalle.cantidad || !detalle.precio) {
      alert("Completa los campos de categoría, nombre, cantidad y precio");
      return;
    }

    const subtotal =
      detalle.cantidad * detalle.precio -
      (detalle.descuento ? (detalle.cantidad * detalle.precio * detalle.descuento) / 100 : 0);

    const nuevoDetalle = {
      ...detalle,
      cantidad: parseFloat(detalle.cantidad),
      precio: parseFloat(detalle.precio),
      descuento: parseFloat(detalle.descuento || 0),
      subtotal,
    };

    const nuevosDetalles = [...compra.detalles, nuevoDetalle];
    const nuevoTotal = nuevosDetalles.reduce((acc, d) => acc + d.subtotal, 0);

    setCompra({ ...compra, detalles: nuevosDetalles, total: nuevoTotal });
    setDetalle({ idcategoria: "", codigo: "", nombre: "", descripcion: "", cantidad: "", precio: "", descuento: "" });
  };

  // ====== ELIMINAR DETALLE ======
  const eliminarDetalle = (index) => {
    const nuevosDetalles = compra.detalles.filter((_, i) => i !== index);
    const nuevoTotal = nuevosDetalles.reduce((acc, d) => acc + d.subtotal, 0);
    setCompra({ ...compra, detalles: nuevosDetalles, total: nuevoTotal });
  };

  // ====== GUARDAR COMPRA ======
  const guardarCompra = async () => {
    if (!compra.idprov || compra.detalles.length === 0) {
      alert("Debes seleccionar un proveedor y al menos un producto");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/compras", compra);
      alert("Compra registrada correctamente");
      setCompra({ idprov: "", nit: "", telefono: "", direccion: "", correo: "", fecha: "", detalles: [], total: 0 });
    } catch (err) {
      console.error("Error al guardar compra:", err);
      alert("Error al registrar la compra");
    }
  };

  // ====== CREAR PROVEEDOR DESDE MODAL ======
  const guardarNuevoProveedor = async () => {
    if (!nuevoProveedor.nombre) {
      alert("El nombre del proveedor es obligatorio");
      return;
    }
    try {
      const res = await axios.post("http://localhost:3000/api/proveedores", nuevoProveedor);
      setProveedores([...proveedores, res.data]); // Agregar a la lista
      setCompra({ ...compra, idprov: res.data.idprov }); // Seleccionarlo automáticamente
      setShowModalProveedor(false);
      setNuevoProveedor({ nombre: "", telefono: "", direccion: "", email: "", nit: "" });
    } catch (err) {
      console.error("Error al crear proveedor:", err);
      alert("No se pudo crear el proveedor");
    }
  };

  return (
    <div className="container mt-4">
      <Card className="shadow p-4">
        <h3 className="mb-4">COMPRA</h3>

        {/* Proveedor y fecha */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Select name="idprov" value={compra.idprov} onChange={handleCompraChange}>
              <option value="">Selecciona proveedor</option>
              {proveedores.map((p) => (
                <option key={p.idprov} value={p.idprov}>
                  {p.nombre}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Button variant="outline-primary" onClick={() => setShowModalProveedor(true)}>
              + Nuevo Proveedor
            </Button>
          </Col>
          <Col md={3}>
            <Form.Control type="date" name="fecha" value={compra.fecha} onChange={handleCompraChange} />
          </Col>
        </Row>

        {/* Tabla de productos */}
        <Table striped bordered hover className="mb-3">
          <thead style={{ background: "#25a18e", color: "#fff" }}>
            <tr>
              <th>CÓDIGO</th>
              <th>CATEGORIA</th>
              <th>NOMBRE</th>
              <th>DETALLE</th>
              <th>CANTIDAD</th>
              <th>PRECIO</th>
              <th>DESCUENTO %</th>
              <th>TOTAL</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {compra.detalles.map((d, i) => (
              <tr key={i}>
                <td>{d.codigo}</td>
                <td>{categorias.find((c) => c.idcategoria === parseInt(d.idcategoria))?.nombre || ""}</td>
                <td>{d.nombre}</td>
                <td>{d.descripcion}</td>
                <td>{d.cantidad}</td>
                <td>Q {d.precio}</td>
                <td>{d.descuento}%</td>
                <td>Q {d.subtotal.toFixed(2)}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => eliminarDetalle(i)}>
                    🗑
                  </Button>
                </td>
              </tr>
            ))}

            {/* Fila para agregar nuevo detalle */}
            <tr>
              <td>
                <Form.Control name="codigo" value={detalle.codigo} onChange={handleDetalleChange} />
              </td>
              <td>
                <Form.Select name="idcategoria" value={detalle.idcategoria} onChange={handleDetalleChange}>
                  <option value="">Selecciona categoría</option>
                  {categorias.map((c) => (
                    <option key={c.idcategoria} value={c.idcategoria}>
                      {c.nombre}
                    </option>
                  ))}
                </Form.Select>
              </td>
              <td>
                <Form.Control name="nombre" value={detalle.nombre} onChange={handleDetalleChange} />
              </td>
              <td>
                <Form.Control name="descripcion" value={detalle.descripcion} onChange={handleDetalleChange} />
              </td>
              <td>
                <Form.Control type="number" name="cantidad" value={detalle.cantidad} onChange={handleDetalleChange} />
              </td>
              <td>
                <Form.Control type="number" name="precio" value={detalle.precio} onChange={handleDetalleChange} />
              </td>
              <td>
                <Form.Control type="number" name="descuento" value={detalle.descuento} onChange={handleDetalleChange} />
              </td>
              <td></td>
              <td>
                <Button variant="success" size="sm" onClick={agregarDetalle}>
                  +
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="d-flex justify-content-between">
          <h5>Precio total: Q {compra.total.toFixed(2)}</h5>
          <Button variant="success" onClick={guardarCompra}>
            Guardar compra
          </Button>
        </div>
      </Card>

      {/* MODAL NUEVO PROVEEDOR */}
      <Modal show={showModalProveedor} onHide={() => setShowModalProveedor(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Proveedor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                name="nombre"
                value={nuevoProveedor.nombre}
                onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                name="telefono"
                value={nuevoProveedor.telefono}
                onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                name="direccion"
                value={nuevoProveedor.direccion}
                onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, direccion: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={nuevoProveedor.email}
                onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>NIT</Form.Label>
              <Form.Control
                name="nit"
                value={nuevoProveedor.nit}
                onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nit: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalProveedor(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarNuevoProveedor}>
            Guardar Proveedor
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Compras;
