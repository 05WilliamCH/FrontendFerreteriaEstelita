// src/pages/DashboardInventario.jsx
import React, { useEffect, useState } from "react";
import { obtenerResumenInventario } from "../services/invdashboard";
import { Card, Table, Row, Col, Container } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardInventario = () => {
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await obtenerResumenInventario();
        setResumen(data);
      } catch (error) {
        console.error("Error al cargar resumen:", error);
      }
    };
    fetchData();
  }, []);

  if (!resumen) return <p className="text-center mt-4">Cargando resumen...</p>;

  // Datos para gráfico de ventas por mes
  const chartData = {
    labels: resumen.ventas_por_mes.map((v) => v.mes),
    datasets: [
      {
        label: "Total de Ventas (Q)",
        data: resumen.ventas_por_mes.map((v) => parseFloat(v.total_ventas)),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">📊 Dashboard de Inventario y Ventas</h2>

      {/* Tarjetas de resumen */}
      <Row className="mb-4 text-center">
        <Col md={4}>
          <Card className="shadow p-3">
            <h6>Total de Productos</h6>
            <h3>{resumen.totalProductos}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow p-3">
            <h6>Valor Total del Inventario</h6>
            <h3>Q {resumen.valorInventario.toFixed(2)}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow p-3">
            <h6>Promedio de Ventas por Cliente</h6>
            <h3>Q {resumen.promedio_ventas_cliente.toFixed(2)}</h3>
          </Card>
        </Col>
      </Row>

      {/* Gráfico de ventas por mes */}
      <Card className="p-4 mb-4 shadow">
        <h5 className="text-center mb-3">Total de Ventas por Mes (Últimos 6 Meses)</h5>
        <Bar data={chartData} />
      </Card>

      {/* Tablas informativas */}
      <Row>
        <Col md={6}>
          <Card className="p-3 shadow mb-4">
            <h5>Productos con Bajo Stock (≤5)</h5>
            <Table striped bordered hover size="sm">
              <thead>
                <tr><th>Producto</th><th>Stock</th></tr>
              </thead>
              <tbody>
                {resumen.productos_bajo_stock.map((p) => (
                  <tr key={p.idproducto}><td>{p.nombre}</td><td>{p.stock}</td></tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="p-3 shadow mb-4">
            <h5>Productos con Mayor Stock</h5>
            <Table striped bordered hover size="sm">
              <thead>
                <tr><th>Producto</th><th>Stock</th></tr>
              </thead>
              <tbody>
                {resumen.productos_mayor_stock.map((p) => (
                  <tr key={p.idproducto}><td>{p.nombre}</td><td>{p.stock}</td></tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="p-3 shadow mb-4">
            <h5>Productos Más Vendidos</h5>
            <Table striped bordered hover size="sm">
              <thead>
                <tr><th>Producto</th><th>Total Vendido</th></tr>
              </thead>
              <tbody>
                {resumen.productos_mas_vendidos.map((p) => (
                  <tr key={p.idproducto}><td>{p.nombre}</td><td>{p.total_vendido}</td></tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="p-3 shadow mb-4">
            <h5>Clientes Más Frecuentes</h5>
            <Table striped bordered hover size="sm">
              <thead>
                <tr><th>Cliente</th><th>Compras</th></tr>
              </thead>
              <tbody>
                {resumen.clientes_frecuentes.map((c) => (
                  <tr key={c.idcliente}><td>{c.nombre}</td><td>{c.total_compras}</td></tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="p-3 shadow mb-4">
            <h5>Proveedores Más Recurrentes</h5>
            <Table striped bordered hover size="sm">
              <thead>
                <tr><th>Proveedor</th><th>Compras</th></tr>
              </thead>
              <tbody>
                {resumen.proveedores_recurrentes.map((p) => (
                  <tr key={p.idprov}><td>{p.nombre}</td><td>{p.total_compras}</td></tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="p-3 shadow mb-4">
            <h5>Productos Próximos a Vencer (30 días)</h5>
            <Table striped bordered hover size="sm">
              <thead>
                <tr><th>Producto</th><th>Fecha Vencimiento</th><th>Stock</th></tr>
              </thead>
              <tbody>
                {resumen.productos_proximos_vencer.map((p) => (
                  <tr key={p.idproducto}>
                    <td>{p.nombre}</td>
                    <td>{new Date(p.fecha_vencimiento).toLocaleDateString()}</td>
                    <td>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardInventario;
