import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table, Alert } from "react-bootstrap";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../services/productoService";
import { obtenerCategorias } from "../services/categoriaService";
import { obtenerProveedores } from "../services/proveedorService";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [form, setForm] = useState({
    codigo: "",
    idcategoria: "",
    idprov: "",
    nombre: "",
    bulto: "",
    detalle: "",
    presentacion: "",
    observaciones: "",
    fecha_vencimiento: "",
    stock: 0,
    precio_compra: 0,
    precio_unitario: 0,
    precio_venta: 0,
    stock_minimo: 0,
  });
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarProveedores();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await obtenerProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setErrorMensaje("No se pudieron cargar los productos.");
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategorias();
      setCategorias(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const cargarProveedores = async () => {
    try {
      const data = await obtenerProveedores();
      setProveedores(data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setShowModal(false);
    setEditando(null);
    setForm({
      codigo: "",
      idcategoria: "",
      idprov: "",
      nombre: "",
      bulto: "",
      detalle: "",
      presentacion: "",
      observaciones: "",
      fecha_vencimiento: "",
      stock: 0,
      precio_compra: 0,
      precio_unitario: 0,
      precio_venta: 0,
      stock_minimo: 0,
    });
    setErrorMensaje("");
  };

  const handleShow = (producto = null) => {
    if (producto) {
      setEditando(producto.idproducto);
      setForm(producto);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await actualizarProducto(editando, form);
      } else {
        await crearProducto(form);
      }
      await cargarProductos();
      handleClose();
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.error ||
        "Ocurrió un error al guardar el producto.";
      setErrorMensaje(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      await eliminarProducto(id);
      cargarProductos();
    } catch (error) {
      console.error(error);
      setErrorMensaje("Ocurrió un error al eliminar el producto.");
    }
  };

  const productosFiltrados = productos.filter(
    (prod) =>
      prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      prod.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Inventario</h2>
      {errorMensaje && <Alert variant="danger">{errorMensaje}</Alert>}

      {/* Barra de búsqueda */}
      <div className="mb-3 d-flex justify-content-between">
        <Form.Control
          type="text"
          placeholder="Buscar por código o producto"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <Button variant="primary" onClick={() => handleShow()}>
          <i className="bi bi-plus-circle"></i> Nuevo Producto
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>Código</th>
            <th>Categoría</th>
            <th>Producto</th>
            <th>Detalle</th>
            <th>Proveedor</th>
            <th>Fecha Ingreso</th>
            <th>Cantidad</th>
            <th>Precio Compra</th>
            <th>Precio Unitario</th>
            <th>Precio Venta</th>
            <th>Presentación</th>
            <th>Observaciones</th>
            <th>Stock Mínimo</th>
            <th>Editar</th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((prod) => (
              <tr
                key={prod.idproducto}
                className={
                  prod.stock <= prod.stock_minimo ? "table-warning" : ""
                }
              >
                <td>{prod.codigo}</td>
                <td>{prod.categoria_nombre}</td>
                <td>{prod.nombre}</td>
                <td>{prod.detalle || "-"}</td>
                <td>{prod.proveedor_nombre}</td>
                <td>{prod.fecha_vencimiento?.slice(0, 10) || "-"}</td>
                <td>{prod.stock}</td>
                <td>{prod.precio_compra}</td>
                <td>{prod.precio_unitario}</td>
                <td>{prod.precio_venta}</td>
                <td>{prod.presentacion || "-"}</td>
                <td>{prod.observaciones || "-"}</td>
                <td>{prod.stock_minimo}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleShow(prod)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </Button>{" "}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(prod.idproducto)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="14" className="text-center">
                No hay productos registrados
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal para crear/editar */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editando ? "Editar Producto" : "Nuevo Producto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Campos básicos */}
            <Form.Group className="mb-2">
              <Form.Label>Código *</Form.Label>
              <Form.Control
                type="text"
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Categoría *</Form.Label>
              <Form.Select
                name="idcategoria"
                value={form.idcategoria}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.idcategoria} value={cat.idcategoria}>
                    {cat.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Proveedor *</Form.Label>
              <Form.Select
                name="idprov"
                value={form.idprov}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un proveedor</option>
                {proveedores.map((prov) => (
                  <option key={prov.idprov} value={prov.idprov}>
                    {prov.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Campos adicionales */}
            <Form.Group className="mb-2">
              <Form.Label>Precio Compra</Form.Label>
              <Form.Control
                type="number"
                name="precio_compra"
                value={form.precio_compra}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Precio Unitario</Form.Label>
              <Form.Control
                type="number"
                name="precio_unitario"
                value={form.precio_unitario}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Precio Venta</Form.Label>
              <Form.Control
                type="number"
                name="precio_venta"
                value={form.precio_venta}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Stock Mínimo</Form.Label>
              <Form.Control
                type="number"
                name="stock_minimo"
                value={form.stock_minimo}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" className="ms-2">
                {editando ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Productos;
