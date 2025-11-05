import React, { useState, useEffect } from "react";
import { obtenerKardex } from "../services/kardexService";
import { Button, Table, Form, Card, Row, Col } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import useAuth from "../hooks/useAuth"; // ✅ Importa tu hook
import { generarPDFKardex } from "../utils/pdfKardex";
import logo from "../assets/ESTELITA.jpeg"; // si tienes un logo en tu proyecto


const Kardex = () => {
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    idusuario: "",
    idcategoria: "",
    busqueda: "",
  });
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [kardex, setKardex] = useState([]);

  const { token } = useAuth(); // ✅ obtenemos el token del contexto

  // === CARGAR CATEGORÍAS Y USUARIOS ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Enviamos el token
          },
        };

        const [catRes, userRes] = await Promise.all([
          axios.get("http://localhost:3000/api/categorias", headers),
          axios.get("http://localhost:3000/api/usuarios", headers),
        ]);

        setCategorias(catRes.data);
        setUsuarios(userRes.data);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
      }
    };
    fetchData();
  }, [token]); // ✅ Se vuelve a ejecutar si cambia el token

  // === MANEJAR CAMBIO DE FILTROS ===
  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  // === BUSCAR MOVIMIENTOS ===
  const handleBuscar = async () => {
    try {
      const data = await obtenerKardex(filtros);
      setKardex(data);
    } catch (error) {
      console.error("Error al obtener kardex:", error);
    }
  };

  return (
    <div className="container mt-4">
      <Card className="shadow p-4 border-0">
        <Card.Title className="text-center mb-4 fs-4 fw-bold text-primary">
          Kardex de Movimientos
        </Card.Title>

        {/* ==== FILTROS ==== */}
        <Row className="mb-3">
          <Col md={2}>
            <Form.Label>Fecha Inicio</Form.Label>
            <Form.Control
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleChange}
            />
          </Col>
          <Col md={2}>
            <Form.Label>Fecha Fin</Form.Label>
            <Form.Control
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Usuario</Form.Label>
            <Form.Select
              name="idusuario"
              value={filtros.idusuario}
              onChange={handleChange}
            >
              <option value="">Todos</option>
              {usuarios.map((user) => (
                <option key={user.idusuario} value={user.idusuario}>
                  {user.nombre}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="idcategoria"
              value={filtros.idcategoria}
              onChange={handleChange}
            >
              <option value="">Todas</option>
              {categorias.map((cat) => (
                <option key={cat.idcategoria} value={cat.idcategoria}>
                  {cat.nombre}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label>Buscar</Form.Label>
            <Form.Control
              type="text"
              name="busqueda"
              placeholder="Nombre o código"
              value={filtros.busqueda}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2 mb-3">
          <Button variant="primary" onClick={handleBuscar}>
          Buscar
          </Button>
          <Button
            variant="success"
            onClick={() => generarPDFKardex(kardex, filtros, logo)}
            disabled={!kardex.length}
          >
          Exportar PDF
          </Button>
        </div>

        {/* ==== TABLA ==== */}
        <Table
          bordered
          hover
          responsive
          className="text-center align-middle shadow-sm"
        >
          <thead className="table-dark">
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Movimiento</th>
              <th>Número Doc.</th>
              <th>Cantidad</th>
              <th>Precio</th>
              {/* <th>Total</th> */}
              <th>Stock Disp.</th>
            </tr>
          </thead>
          <tbody>
            {kardex.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-muted">
                  No hay registros disponibles
                </td>
              </tr>
            ) : (
              kardex.map((item, index) => (
                <tr key={index}>
                  <td>{item.codigo}</td>
                  <td>{item.producto}</td>
                  <td>{item.categoria}</td>
                  <td>{new Date(item.fecha_movimiento).toLocaleString()}</td>
                  <td>{item.usuario}</td>
                  <td
                    className={
                      item.tipo_movimiento === "COMPRA"
                        ? "text-success fw-bold"
                        : "text-danger fw-bold"
                    }
                  >
                    {item.tipo_movimiento}
                  </td>
                  <td>{item.numerodocumento || item.numerofactura || "—"}</td>
                  <td>{item.cantidad}</td>
                  <td>Q{Number(item.precio).toFixed(2)}</td>
                  {/* <td>Q{Number(item.total).toFixed(2)}</td> */}
                  <td>{item.stock}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default Kardex;
