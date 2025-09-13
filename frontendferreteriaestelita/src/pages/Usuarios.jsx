import React, { useEffect, useState } from "react";
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../services/usuarioService";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    usuario_password: "",
    idrol: 1,
    estado: true,
  });
  const [editForm, setEditForm] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Cargar usuarios
  const cargarUsuarios = async () => {
    try {
      const data = await obtenerUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      alert(err.error || "Error al cargar usuarios");
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  // Crear usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.endsWith("@gmail.com")) {
      setErrorMsg("El correo debe ser Gmail válido");
      return;
    }

    try {
      await crearUsuario({
        ...form,
        idrol: Number(form.idrol),
        estado: Boolean(form.estado),
      });
      setShowCreateModal(false);
      setForm({
        nombre: "",
        telefono: "",
        email: "",
        usuario_password: "",
        idrol: 1,
        estado: true,
      });
      setErrorMsg("");
      cargarUsuarios();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Error al crear usuario");
    }
  };

  // Actualizar usuario
  const handleUpdate = async (e) => {
    e.preventDefault();

    const data = {
      nombre: editForm.nombre,
      telefono: editForm.telefono,
      email: editForm.email,
      idrol: Number(editForm.idrol),
      estado: editForm.estado === "true" || editForm.estado === true,
    };

    // Solo enviar la contraseña si el usuario escribe algo
    if (editForm.usuario_password && editForm.usuario_password.trim() !== "") {
      data.usuario_password = editForm.usuario_password;
    }

    try {
      await actualizarUsuario(editForm.idusuario, data);
      setShowEditModal(false);
      setEditForm(null);
      cargarUsuarios();
    } catch (err) {
      alert(err.response?.data?.error || "Error al actualizar usuario");
    }
  };

  // Eliminar usuario
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await eliminarUsuario(id);
      cargarUsuarios();
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar usuario");
    }
  };

  // Mostrar rol
  const rolBadge = (idrol) => {
    switch (idrol) {
      case 1:
        return <span className="badge bg-primary">Admin</span>;
      case 2:
        return <span className="badge bg-warning text-dark">Contador</span>;
      case 3:
        return <span className="badge bg-info text-dark">Empleado</span>;
      default:
        return <span className="badge bg-secondary">Desconocido</span>;
    }
  };

  return (
    <div className="container mt-4">
      <h3>Gestión de Usuarios</h3>
      <button
        className="btn btn-info mb-3 text-white"
        onClick={() => setShowCreateModal(true)}
      >
        Agregar Usuario
      </button>

      <table className="table table-bordered text-center">
        <thead className="table-primary">
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length > 0 ? (
            usuarios.map((u) => (
              <tr key={u.idusuario}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.telefono}</td>
                <td>{rolBadge(u.idrol)}</td>
                <td>
                  {u.estado ? (
                    <span className="badge bg-success">Activo</span>
                  ) : (
                    <span className="badge bg-danger">Inactivo</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => {
                      setEditForm({ ...u, estado: String(u.estado) });
                      setShowEditModal(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleEliminar(u.idusuario)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No hay usuarios</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Crear */}
      {showCreateModal && (
        <ModalCrear
          form={form}
          setForm={setForm}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          errorMsg={errorMsg}
          close={() => setShowCreateModal(false)}
        />
      )}

      {/* Modal Editar */}
      {showEditModal && editForm && (
        <ModalEditar
          editForm={editForm}
          handleEditChange={handleEditChange}
          handleUpdate={handleUpdate}
          close={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

const ModalCrear = ({ form, setForm, handleChange, handleSubmit, errorMsg, close }) => (
  <div className="modal show d-block">
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5>Agregar Usuario</h5>
            <button type="button" className="btn-close" onClick={close}></button>
          </div>

          <div className="modal-body row g-3">
            {errorMsg && <div className="alert alert-danger w-100">{errorMsg}</div>}

            <div className="col-md-6">
              <label>Nombre</label>
              <input
                name="nombre"
                value={form.nombre || ""}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6">
              <label>Teléfono</label>
              <input
                name="telefono"
                value={form.telefono || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label>Correo</label>
              <input
                name="email"
                type="email"
                value={form.email || ""}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6">
              <label>Contraseña</label>
              <input
                name="password" // ⚠ debe coincidir con lo que espera el backend
                type="password"
                value={form.password || ""}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6">
              <label>Rol</label>
              <select
                name="idrol"
                value={form.idrol || 1}
                onChange={handleChange}
                className="form-select"
              >
                <option value={1}>Administrativo</option>
                <option value={2}>Contador</option>
                <option value={3}>Empleado</option>
              </select>
            </div>

            <div className="col-md-6">
              <label>Estado</label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="form-select"
              >
                <option value={true}>Activo</option>
                <option value={false}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={close}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-success">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

// ✅ Modal Editar con contraseña opcional
const ModalEditar = ({ editForm, handleEditChange, handleUpdate, close }) => (
  <div className="modal show d-block">
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <form onSubmit={handleUpdate}>
          <div className="modal-header">
            <h5>Editar Usuario</h5>
            <button type="button" className="btn-close" onClick={close}></button>
          </div>

          <div className="modal-body row g-3">
            <div className="col-md-6">
              <label>Nombre</label>
              <input
                name="nombre"
                value={editForm.nombre}
                onChange={handleEditChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6">
              <label>Teléfono</label>
              <input
                name="telefono"
                value={editForm.telefono || ""}
                onChange={handleEditChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label>Correo</label>
              <input
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleEditChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-6">
              <label>Contraseña (opcional)</label>
              <input
                name="password"  // ⚠ clave: cambiar de usuario_password a password
                type="password"
                value={editForm.password || ""}
                onChange={handleEditChange}
                className="form-control"
                placeholder="Dejar vacío si no deseas cambiar"
              />
            </div>

            <div className="col-md-6">
              <label>Rol</label>
              <select
                name="idrol"
                value={editForm.idrol}
                onChange={handleEditChange}
                className="form-select"
              >
                <option value={1}>Administrativo</option>
                <option value={2}>Contador</option>
                <option value={3}>Empleado</option>
              </select>
            </div>

            <div className="col-md-6">
              <label>Estado</label>
              <select
                name="estado"
                value={editForm.estado}
                onChange={handleEditChange}
                className="form-select"
              >
                <option value={true}>Activo</option>
                <option value={false}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={close}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-success">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);



export default Usuarios;
