import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table } from "react-bootstrap";
import {
  obtenerDevoluciones,
  crearDevolucion,
  actualizarDevolucion,
  eliminarDevolucion,
} from "../services/devolucionesService"; // Debes crear este service similar a proveedorService

const Devoluciones = () => {
  const [devoluciones, setDevoluciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nombre_cliente: "",
    nombre_producto: "",
    cantidad: "",
    observaciones: "",
    telefono: "",
    numero_factura: "",
  });

  // Busqueda y ordenamiento
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState({ campo: "", asc: true });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 6;

  useEffect(() => {
    cargarDevoluciones();
  }, []);

  const cargarDevoluciones = async () => {
    try {
      const data = await obtenerDevoluciones();
      setDevoluciones(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setShowModal(false);
    setEditando(null);
    setForm({
      nombre_cliente: "",
      nombre_producto: "",
      cantidad: "",
      observaciones: "",
      telefono: "",
      numero_factura: "",
    });
  };

  const handleShow = (devolucion = null) => {
    if (devolucion) {
      setEditando(devolucion.iddevolucion);
      setForm(devolucion);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await actualizarDevolucion(editando, form);
      } else {
        await crearDevolucion(form);
      }
      cargarDevoluciones();
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta devolución?")) return;
    try {
      await eliminarDevolucion(id);
      cargarDevoluciones();
    } catch (error) {
      console.error(error);
    }
  };

  // Filtrar devoluciones
  const devolucionesFiltradas = devoluciones.filter(
    (dev) =>
      dev.nombre_cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      dev.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
      (dev.numero_factura && dev.numero_factura.includes(busqueda))
  );

  // Ordenar devoluciones
  const ordenar = (campo) => {
    const asc = orden.campo === campo ? !orden.asc : true;
    const sorted = [...devolucionesFiltradas].sort((a, b) => {
      if (!a[campo]) return 1;
      if (!b[campo]) return -1;
      if (a[campo] < b[campo]) return asc ? -1 : 1;
      if (a[campo] > b[campo]) return asc ? 1 : -1;
      return 0;
    });
    setOrden({ campo, asc });
    setDevoluciones(sorted);
  };

  // Paginación
  const indexUltimo = paginaActual * registrosPorPagina;
  const indexPrimero = indexUltimo - registrosPorPagina;
  const registrosPaginados = devolucionesFiltradas.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(devolucionesFiltradas.length / registrosPorPagina);

  const renderIconoOrden = (campo) => {
    if (orden.campo !== campo) return <i className="bi bi-arrow-down-up ms-1"></i>;
    return orden.asc ? <i className="bi bi-arrow-up ms-1"></i> : <i className="bi bi-arrow-down ms-1"></i>;
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Gestión de Devoluciones</h2>

      <div className="d-flex justify-content-between mb-2">
        <Button variant="primary" onClick={() => handleShow()}>
          <i className="bi bi-plus-circle"></i> Nueva Devolución
        </Button>
        <Form.Control
          type="text"
          placeholder="Buscar por Cliente, Producto o Factura..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
      </div>

      <Table striped bordered hover responsive className="mt-3">
        <thead className="table-dark">
          <tr>
            <th onClick={() => ordenar("nombre_cliente")} style={{ cursor: "pointer" }}>
              Cliente {renderIconoOrden("nombre_cliente")}
            </th>
            <th onClick={() => ordenar("nombre_producto")} style={{ cursor: "pointer" }}>
              Producto {renderIconoOrden("nombre_producto")}
            </th>
            <th>Cantidad</th>
            <th>Observaciones</th>
            <th>Teléfono</th>
            <th>Factura</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {registrosPaginados.length > 0 ? (
            registrosPaginados.map((dev) => (
              <tr key={dev.iddevolucion}>
                <td>{dev.nombre_cliente}</td>
                <td>{dev.nombre_producto}</td>
                <td>{dev.cantidad}</td>
                <td>{dev.observaciones || "-"}</td>
                <td>{dev.telefono || "-"}</td>
                <td>{dev.numero_factura || "-"}</td>
                <td>{dev.fecha ? new Date(dev.fecha).toLocaleDateString("es-ES") : "-"}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleShow(dev)}>
                    <i className="bi bi-pencil-square"></i>
                  </Button>{" "}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(dev.iddevolucion)}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No hay devoluciones registradas
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <nav>
            <ul className="pagination">
              {Array.from({ length: totalPaginas }, (_, i) => (
                <li key={i + 1} className={`page-item ${paginaActual === i + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setPaginaActual(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editando ? "Editar Devolución" : "Nueva Devolución"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Cliente *</Form.Label>
              <Form.Control
                type="text"
                name="nombre_cliente"
                value={form.nombre_cliente}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Producto *</Form.Label>
              <Form.Control
                type="text"
                name="nombre_producto"
                value={form.nombre_producto}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Cantidad *</Form.Label>
              <Form.Control
                type="text"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                type="text"
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Factura</Form.Label>
              <Form.Control
                type="text"
                name="numero_factura"
                value={form.numero_factura}
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

export default Devoluciones;
