import React from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ModernDashboard = () => {
  // Datos de los cards
  const totalVentas = 0;
  const totalProductos = 15;
  const totalCategorias = 15;

  // Datos de la gráfica de barras
  const barData = {
    labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    datasets: [
      {
        label: "Ventas",
        data: [24, 11, 29, 6, 24, 15, 20],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Ventas últimos 7 días", font: { size: 16 } },
    },
  };

  // Datos de la gráfica circular
  const pieData = {
    labels: ["Categoría A", "Categoría B", "Categoría C"],
    datasets: [
      {
        label: "Productos por categoría",
        data: [10, 25, 15],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
        ],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Productos por categoría" },
    },
  };

  return (
    <Container fluid className="p-4">
      {/* Bienvenida */}
      <Card className="mb-4 shadow-sm bg-light">
        <Card.Body>
          <h2 className="card-title">¡Bienvenido!</h2>
          <p className="card-text">Ferretería La Estelita</p>
        </Card.Body>
      </Card>

      {/* Cards de totales */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center shadow-sm p-3 mb-3">
            <h6>Total de Ventas</h6>
            <h3>{totalVentas}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm p-3 mb-3 bg-success text-white">
            <h6>Total de Productos</h6>
            <h3>{totalProductos}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm p-3 mb-3 bg-warning text-dark">
            <h6>Total de Categorías</h6>
            <h3>{totalCategorias}</h3>
          </Card>
        </Col>
      </Row>

      {/* Gráficas */}
      <Row>
        <Col lg={8} className="mb-4">
          <Card className="p-3 shadow-sm">
            <Bar data={barData} options={barOptions} />
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card className="p-3 shadow-sm">
            <Pie data={pieData} options={pieOptions} />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ModernDashboard;
