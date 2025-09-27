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
  });
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState({ campo: "", asc: true });

  // 🔥 Ahora el usuario puede elegir cuántos productos ver por página
  const [registrosPorPagina, setRegistrosPorPagina] = useState(20);
  const [paginaActual, setPaginaActual] = useState(1);

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
    });
    setErrorMensaje("");
  };

  const handleShow = (producto = null) => {
    if (producto) {
      setEditando(producto.idproducto);
      setForm({
        ...producto,
        idcategoria: producto.idcategoria || "",
        idprov: producto.idprov || "",
        fecha_vencimiento: producto.fecha_vencimiento || "",
        stock: producto.stock || 0,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const codigoExistente = productos.find(
      (p) => p.codigo === form.codigo && (!editando || p.idproducto !== editando)
    );

    if (codigoExistente) {
      setErrorMensaje("Ya existe un producto con este código.");
      return;
    }

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
      const msg =
        error.response?.data?.error ||
        "Ocurrió un error al eliminar el producto.";
      setErrorMensaje(msg);
    }
  };

  const productosFiltrados = productos.filter(
    (prod) =>
      prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      prod.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const ordenar = (campo) => {
    const asc = orden.campo === campo ? !orden.asc : true;
    const sorted = [...productosFiltrados].sort((a, b) => {
      if (!a[campo]) return 1;
      if (!b[campo]) return -1;
      if (a[campo] < b[campo]) return asc ? -1 : 1;
      if (a[campo] > b[campo]) return asc ? 1 : -1;
      return 0;
    });
    setOrden({ campo, asc });
    setProductos(sorted);
  };

  const indexUltimo = paginaActual * registrosPorPagina;
  const indexPrimero = indexUltimo - registrosPorPagina;
  const registrosPaginados = productosFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(
    productosFiltrados.length / registrosPorPagina
  );

  const renderIconoOrden = (campo) => {
    if (orden.campo !== campo) return <i className="bi bi-arrow-down-up ms-1"></i>;
    return orden.asc ? (
      <i className="bi bi-arrow-up ms-1"></i>
    ) : (
      <i className="bi bi-arrow-down ms-1"></i>
    );
  };

  const formatearFecha = (fecha) => {
    return fecha ? new Date(fecha).toLocaleDateString("es-ES") : "-";
  };

  const esProximoAVencer = (fecha) => {
    if (!fecha) return false;
    const hoy = new Date();
    const fechaVenc = new Date(fecha);
    const diffDias = (fechaVenc - hoy) / (1000 * 60 * 60 * 24);
    return diffDias <= 30 && diffDias >= 0;
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Gestión de Productos</h2>
      {errorMensaje && <Alert variant="danger">{errorMensaje}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-2">
        <Form.Control
          type="text"
          placeholder="Buscar por Nombre o Código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: "300px" }}
        />

        {/* 🔥 Selector de cantidad por página */}
        <Form.Select
          value={registrosPorPagina}
          onChange={(e) => {
            setPaginaActual(1);
            setRegistrosPorPagina(Number(e.target.value));
          }}
          style={{ width: "150px" }}
        >
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
        </Form.Select>

        <Button variant="primary" onClick={() => handleShow()}>
          <i className="bi bi-plus-circle"></i> Nuevo Producto
        </Button>
      </div>

      <div style={{ overflowX: "auto" }}>
        {/* Tabla compacta */}
        <Table striped bordered hover responsive className="mt-3 table-sm small">
          <thead className="table-dark">
            <tr>
              <th onClick={() => ordenar("codigo")} style={{ cursor: "pointer" }}>
                Código {renderIconoOrden("codigo")}
              </th>
              <th onClick={() => ordenar("nombre")} style={{ cursor: "pointer" }}>
                Nombre {renderIconoOrden("nombre")}
              </th>
              <th>Categoría</th>
              <th>Proveedor</th>
              <th>Bulto</th>
              <th>Detalle</th>
              <th>Presentación</th>
              <th>Observaciones</th>
              <th>Stock</th>
              <th>Vencimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registrosPaginados.length > 0 ? (
              registrosPaginados.map((prod) => (
                <tr key={prod.idproducto}>
                  <td>{prod.codigo}</td>
                  <td>{prod.nombre}</td>
                  <td>{prod.categoria}</td>
                  <td>{prod.proveedor}</td>
                  <td>{prod.bulto || "-"}</td>
                  <td>{prod.detalle || "-"}</td>
                  <td>{prod.presentacion || "-"}</td>
                  <td>{prod.observaciones || "-"}</td>
                  <td>{prod.stock}</td>
                  <td
                    style={{
                      color: esProximoAVencer(prod.fecha_vencimiento)
                        ? "red"
                        : "black",
                    }}
                  >
                    {formatearFecha(prod.fecha_vencimiento)}
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleShow(prod)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>{" "}
                    <Button
                      variant="danger"
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
                <td colSpan="11" className="text-center">
                  No hay productos registrados
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <nav>
            <ul className="pagination">
              {Array.from({ length: totalPaginas }, (_, i) => (
                <li
                  key={i + 1}
                  className={`page-item ${paginaActual === i + 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPaginaActual(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editando ? "Editar Producto" : "Nuevo Producto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMensaje && <Alert variant="danger">{errorMensaje}</Alert>}
          <Form onSubmit={handleSubmit}>
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
            <Form.Group className="mb-2">
              <Form.Label>Bulto</Form.Label>
              <Form.Control
                type="text"
                name="bulto"
                value={form.bulto || ""}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Detalle</Form.Label>
              <Form.Control
                type="text"
                name="detalle"
                value={form.detalle || ""}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Presentación</Form.Label>
              <Form.Control
                type="text"
                name="presentacion"
                value={form.presentacion || ""}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                type="text"
                name="observaciones"
                value={form.observaciones || ""}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Fecha de Vencimiento</Form.Label>
              <Form.Control
                type="date"
                name="fecha_vencimiento"
                value={form.fecha_vencimiento || ""}
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
