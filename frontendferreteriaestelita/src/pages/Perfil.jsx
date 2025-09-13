import React, { useEffect, useState } from "react";
import { actualizarUsuario, obtenerUsuarios } from "../services/usuarioService";
import { Card, Form, Button, Row, Col } from "react-bootstrap";

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    idrol: "",
    estado: true,
    password: "", // solo si desea cambiarla
  });

  // Simulamos usuario logueado
  const idUsuarioLogueado = 1; // ⚠️ aquí deberías tomarlo del JWT o localStorage

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await obtenerUsuarios();
        const u = data.find((user) => user.idusuario === idUsuarioLogueado);
        setUsuario(u);
        setForm({
          nombre: u.nombre,
          telefono: u.telefono,
          email: u.email,
          idrol: u.idrol,
          estado: u.estado,
          password: "",
        });
      } catch (error) {
        console.error("Error cargando perfil", error);
      }
    };
    cargarPerfil();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      nombre: form.nombre,
      telefono: form.telefono,
      email: form.email,
      idrol: Number(form.idrol),
      estado: form.estado === "true" || form.estado === true,
    };

    if (form.password && form.password.trim() !== "") {
      data.password = form.password;
    }

    try {
      await actualizarUsuario(usuario.idusuario, data);
      alert("✅ Perfil actualizado correctamente");
      setForm({ ...form, password: "" });
    } catch (error) {
      alert(error.response?.data?.error || "Error al actualizar perfil");
    }
  };

  if (!usuario) return <p className="text-center mt-4">Cargando perfil...</p>;

  return (
    <div className="container mt-4">
      <Row>
        {/* Mis Datos */}
        <Col md={6}>
          <Card>
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Mis Datos</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <img
                  src="/ESTELITA.jpeg"
                  alt="perfil"
                  className="img-thumbnail"
                  style={{ width: "150px", height: "150px" }}
                />
              </div>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Correo</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
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
                  <Form.Label>Rol</Form.Label>
                  <Form.Control
                    type="text"
                    value={
                      form.idrol === 1
                        ? "Administrador"
                        : form.idrol === 2
                        ? "Contador"
                        : "Empleado"
                    }
                    readOnly
                  />
                </Form.Group>
                <div className="d-grid mt-3">
                  <Button type="submit" variant="info" className="text-white">
                    Guardar Cambios
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Cambiar Contraseña */}
        <Col md={6}>
          <Card>
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Cambiar Contraseña</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Form.Label>Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                  />
                </Form.Group>
                <div className="d-grid mt-3">
                  <Button type="submit" variant="info" className="text-white">
                    Guardar Cambios
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Perfil;
