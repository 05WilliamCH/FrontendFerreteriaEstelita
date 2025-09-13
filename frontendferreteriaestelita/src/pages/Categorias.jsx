import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table } from "react-bootstrap";
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../services/categoriaService";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: "" });

  // Busqueda y ordenamiento
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState({ campo: "", asc: true });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 6;

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategorias();
      setCategorias(data);
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
    setForm({ nombre: "" });
  };

  const handleShow = (categoria = null) => {
    if (categoria) {
      setEditando(categoria.idcategoria);
      setForm({ nombre: categoria.nombre });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await actualizarCategoria(editando, form);
      } else {
        await crearCategoria(form);
      }
      cargarCategorias();
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      await eliminarCategoria(id);
      cargarCategorias();
    } catch (error) {
      console.error(error);
    }
  };

  // Filtrar categorías
  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Ordenar categorías
  const ordenar = (campo) => {
    const asc = orden.campo === campo ? !orden.asc : true;
    const sorted = [...categoriasFiltradas].sort((a, b) => {
      if (!a[campo]) return 1;
      if (!b[campo]) return -1;
      if (a[campo] < b[campo]) return asc ? -1 : 1;
      if (a[campo] > b[campo]) return asc ? 1 : -1;
      return 0;
    });
    setOrden({ campo, asc });
    setCategorias(sorted);
  };

  // Paginación
  const indexUltimo = paginaActual * registrosPorPagina;
  const indexPrimero = indexUltimo - registrosPorPagina;
  const registrosPaginados = categoriasFiltradas.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(categoriasFiltradas.length / registrosPorPagina);

  const renderIconoOrden = (campo) => {
    if (orden.campo !== campo) return <i className="bi bi-arrow-down-up ms-1"></i>;
    return orden.asc ? <i className="bi bi-arrow-up ms-1"></i> : <i className="bi bi-arrow-down ms-1"></i>;
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Gestión de Categorías</h2>

      <div className="d-flex justify-content-between mb-2">
        <Button variant="primary" onClick={() => handleShow()}>
          <i className="bi bi-plus-circle"></i> Nueva Categoría
        </Button>
        <Form.Control
          type="text"
          placeholder="Buscar por nombre..."
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
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {registrosPaginados.length > 0 ? (
            registrosPaginados.map((cat) => (
              <tr key={cat.idcategoria}>
                <td>{cat.nombre}</td>
                <td>{cat.fechacreacion ? new Date(cat.fechacreacion).toLocaleDateString("es-ES") : "-"}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleShow(cat)}>
                    <i className="bi bi-pencil-square"></i>
                  </Button>{" "}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(cat.idcategoria)}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No hay categorías registradas
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
          <Modal.Title>{editando ? "Editar Categoría" : "Nueva Categoría"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
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

export default Categorias;
