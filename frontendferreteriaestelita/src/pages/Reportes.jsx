import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Container, Table, Spinner } from "react-bootstrap";
import axios from "axios";

const Reportes = () => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [informe, setInforme] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [categoria, setCategoria] = useState("");
  const [producto, setProducto] = useState("");
  const [cliente, setCliente] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [masVendidos, setMasVendidos] = useState("");
  const [stock, setStock] = useState("");

  const [reporte, setReporte] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar opciones dinámicas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, cliRes, provRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/categorias`),
          axios.get(`${import.meta.env.VITE_API_URL}/productos`),
          axios.get(`${import.meta.env.VITE_API_URL}/clientes`),
          axios.get(`${import.meta.env.VITE_API_URL}/proveedores`),
        ]);

        setCategorias(catRes.data);
        setProductos(prodRes.data);
        setClientes(cliRes.data);
        setProveedores(provRes.data);
      } catch (error) {
        console.error("Error cargando datos para reportes:", error);
      }
    };

    fetchData();
  }, []);

  const handleGenerarReporte = async () => {
    setLoading(true);
    try {
      const filtros = {
        informe,
        fechaInicio,
        fechaFin,
        categoria,
        producto,
        cliente,
        proveedor,
        masVendidos,
        stock,
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/reportes`, filtros);
      setReporte(res.data); // suponiendo que el backend devuelve un array con datos
    } catch (err) {
      console.error("Error generando reporte:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = async () => {
    try {
      const filtros = {
        informe,
        fechaInicio,
        fechaFin,
        categoria,
        producto,
        cliente,
        proveedor,
        masVendidos,
        stock,
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/reportes/pdf`, filtros, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Reporte.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Error descargando PDF:", err);
    }
  };

  return (
    <Container className="p-4 bg-light rounded shadow">
      <h2 className="text-center fw-bold mb-4">REPORTES</h2>

      {/* FILA 1 - BOTÓN + INFORME + FECHAS */}
      <Row className="mb-3">
        <Col md={3}>
          <Button
            variant="success"
            className="w-100 fw-bold"
            onClick={handleGenerarReporte}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Generar Reporte"}
          </Button>
        </Col>

        <Col md={3}>
          <Form.Select value={informe} onChange={(e) => setInforme(e.target.value)}>
            <option value="">INFORME DE ACCIONES</option>
            <option value="ventas">Ventas</option>
            <option value="compras">Compras</option>
            <option value="movimientos">Movimientos</option>
          </Form.Select>
        </Col>

        <Col md={3}>
          <Form.Control
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </Col>

        <Col md={3}>
          <Form.Control
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </Col>
      </Row>

      {/* FILA 2 - CATEGORÍA / PRODUCTO / MÁS VENDIDOS */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">ELIJA CATEGORIA (OPCIONAL)</option>
            {categorias.map((c) => (
              <option key={c.idcategoria} value={c.idcategoria}>
                {c.nombre}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={4}>
          <Form.Select value={producto} onChange={(e) => setProducto(e.target.value)}>
            <option value="">ELIJA PRODUCTO (OPCIONAL)</option>
            {productos.map((p) => (
              <option key={p.idproducto} value={p.idproducto}>
                {p.nombre}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={4}>
          <Form.Select value={masVendidos} onChange={(e) => setMasVendidos(e.target.value)}>
            <option value="">MAS VENDIDOS (OPCIONAL)</option>
            <option value="top5">Top 5</option>
            <option value="top10">Top 10</option>
          </Form.Select>
        </Col>
      </Row>

      {/* FILA 3 - PROVEEDOR / CLIENTE / STOCK */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Select value={proveedor} onChange={(e) => setProveedor(e.target.value)}>
            <option value="">ELIJA PROVEEDOR (OPCIONAL)</option>
            {proveedores.map((prov) => (
              <option key={prov.idprov} value={prov.idprov}>
                {prov.nombre}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={4}>
          <Form.Select value={cliente} onChange={(e) => setCliente(e.target.value)}>
            <option value="">ELIJA CLIENTE (OPCIONAL)</option>
            {clientes.map((cli) => (
              <option key={cli.idcliente} value={cli.idcliente}>
                {cli.nombre}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={4}>
          <Form.Select value={stock} onChange={(e) => setStock(e.target.value)}>
            <option value="">ELIJA STOCK (OPCIONAL)</option>
            <option value="bajo">Stock Bajo</option>
            <option value="agotado">Agotado</option>
            <option value="disponible">Disponible</option>
          </Form.Select>
        </Col>
      </Row>

      {/* TABLA DE RESULTADOS */}
      {reporte.length > 0 && (
        <>
          <h5 className="fw-bold mb-3">Resultados:</h5>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                {Object.keys(reporte[0]).map((col, index) => (
                  <th key={index}>{col.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reporte.map((fila, i) => (
                <tr key={i}>
                  {Object.values(fila).map((valor, j) => (
                    <td key={j}>{valor}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>

          <Button variant="danger" onClick={handleDescargarPDF}>
            Descargar PDF
          </Button>
        </>
      )}
    </Container>
  );
};

export default Reportes;
