import React, { useEffect, useState } from "react";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const ModernDashboard = () => {
  const [totales, setTotales] = useState({
    total_productos: 0,
    total_categorias: 0,
    productosPorCategoria: [],
  });
  const [ventasSemana, setVentasSemana] = useState([]);
  const [ventasHoy, setVentasHoy] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/dashboard/datos");
        const data = await res.json();

        setTotales({
          ...data.totales,
          productosPorCategoria: data.productosPorCategoria,
        });
        setVentasSemana(data.ventasSemana);
        setVentasHoy(data.ventasHoy);
      } catch (error) {
        console.error("Error al obtener datos del dashboard:", error);
      }
    };

    fetchData();
  }, []);

  // Genera colores dinámicos para el gráfico circular
  const generarColores = (cantidad) => {
    const colores = [];
    for (let i = 0; i < cantidad; i++) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      colores.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
    }
    return colores;
  };

  // Gráfico de barras (ventas últimos 7 días)
  const barData = {
    labels: ventasSemana.map((v) => v.dia),
    datasets: [
      {
        label: "Ventas (Q)",
        data: ventasSemana.map((v) => parseFloat(v.total_ventas)),
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

  // Gráfico circular (productos por categoría)
  const pieData = {
    labels: totales.productosPorCategoria?.map((p) => p.nombre_categoria) || [],
    datasets: [
      {
        label: "Productos por categoría",
        data: totales.productosPorCategoria?.map((p) => p.cantidad) || [],
        backgroundColor: generarColores(totales.productosPorCategoria?.length || 0),
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
            <h6>Total de Ventas Hoy</h6>
            <h3>Q {ventasHoy}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm p-3 mb-3 bg-success text-white">
            <h6>Total de Productos</h6>
            <h3>{totales.total_productos}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm p-3 mb-3 bg-warning text-dark">
            <h6>Total de Categorías</h6>
            <h3>{totales.total_categorias}</h3>
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
