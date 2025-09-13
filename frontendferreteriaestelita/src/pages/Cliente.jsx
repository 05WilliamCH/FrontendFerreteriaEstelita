import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table } from "react-bootstrap";
import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from "../services/clienteService";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    email: "",
    nit: "",
  });

  // Busqueda y ordenamiento
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState({ campo: "", asc: true });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 6;

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const data = await obtenerClientes();
      setClientes(data);
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
    setForm({ nombre: "", telefono: "", direccion: "", email: "", nit: "" });
  };

  const handleShow = (cliente = null) => {
    if (cliente) {
      setEditando(cliente.idcliente);
      setForm(cliente);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await actualizarCliente(editando, form);
      } else {
        await crearCliente(form);
      }
      cargarClientes();
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;
    try {
      await eliminarCliente(id);
      cargarClientes();
    } catch (error) {
      console.error(error);
    }
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.telefono && c.telefono.includes(busqueda)) ||
      (c.nit && c.nit.includes(busqueda))
  );

  // Ordenar clientes
  const ordenar = (campo) => {
    const asc = orden.campo === campo ? !orden.asc : true;
    const sorted = [...clientesFiltrados].sort((a, b) => {
      if (!a[campo]) return 1;
      if (!b[campo]) return -1;
      if (a[campo] < b[campo]) return asc ? -1 : 1;
      if (a[campo] > b[campo]) return asc ? 1 : -1;
      return 0;
    });
    setOrden({ campo, asc });
    setClientes(sorted);
  };

  // Paginación
  const indexUltimo = paginaActual * registrosPorPagina;
  const indexPrimero = indexUltimo - registrosPorPagina;
  const registrosPaginados = clientesFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(clientesFiltrados.length / registrosPorPagina);

  // Icono de ordenamiento
  const renderIconoOrden = (campo) => {
    if (orden.campo !== campo) return <i className="bi bi-arrow-down-up ms-1"></i>;
    return orden.asc ? <i className="bi bi-arrow-up ms-1"></i> : <i className="bi bi-arrow-down ms-1"></i>;
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Gestión de Clientes</h2>

      <div className="d-flex justify-content-between mb-2">
        <Button variant="primary" onClick={() => handleShow()}>
          <i className="bi bi-plus-circle"></i> Nuevo Cliente
        </Button>
        <Form.Control
          type="text"
          placeholder="Buscar por Nombre, Teléfono o NIT..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
      </div>

      <Table striped bordered hover responsive className="mt-3">
        <thead className="table-dark">
          <tr>
            <th onClick={() => ordenar("nombre")} style={{ cursor: "pointer" }}>
              Nombre {renderIconoOrden("nombre")}
            </th>
            <th onClick={() => ordenar("telefono")} style={{ cursor: "pointer" }}>
              Teléfono {renderIconoOrden("telefono")}
            </th>
            <th>Dirección</th>
            <th onClick={() => ordenar("nit")} style={{ cursor: "pointer" }}>
              NIT {renderIconoOrden("nit")}
            </th>
            <th>Email</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {registrosPaginados.length > 0 ? (
            registrosPaginados.map((c) => (
              <tr key={c.idcliente}>
                <td>{c.nombre}</td>
                <td>{c.telefono || "-"}</td>
                <td>{c.direccion || "-"}</td>
                <td>{c.nit || "-"}</td>
                <td>{c.email || "-"}</td>
                <td>{c.fechacreacion ? new Date(c.fechacreacion).toLocaleDateString("es-ES") : "-"}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleShow(c)}>
                    <i className="bi bi-pencil-square"></i>
                  </Button>{" "}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(c.idcliente)}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No hay clientes registrados
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
          <Modal.Title>{editando ? "Editar Cliente" : "Nuevo Cliente"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control type="text" name="telefono" value={form.telefono} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Dirección</Form.Label>
              <Form.Control type="text" name="direccion" value={form.direccion} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={form.email} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>NIT</Form.Label>
              <Form.Control type="text" name="nit" value={form.nit} onChange={handleChange} />
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
              <Button variant="primary" type="submit" className="ms-2">{editando ? "Actualizar" : "Guardar"}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Clientes;
