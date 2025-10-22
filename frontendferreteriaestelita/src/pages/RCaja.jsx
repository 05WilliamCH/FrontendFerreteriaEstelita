import React, { useEffect, useState } from "react";
import {
  obtenerReporteCajas,
  obtenerReporteCajasPorFechas,
} from "../services/cajaService";
import { exportarPDFCajas } from "../utils/pdfHelperCaja"; 
import jsPDF from "jspdf";
import "jspdf-autotable";

const ReporteCajas = () => {
  const [cajas, setCajas] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarCajas();
  }, []);

  const cargarCajas = async () => {
    setLoading(true);
    try {
      const data = await obtenerReporteCajas();
      setCajas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarPorFechas = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("Selecciona ambas fechas para filtrar.");
      return;
    }
    setLoading(true);
    try {
      const data = await obtenerReporteCajasPorFechas(fechaInicio, fechaFin);
      setCajas(data);
    } catch (error) {
      console.error("Error al filtrar cajas por fechas:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleString("es-GT", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  // ----------------------
  // Exportar PDF usando helper
  // ----------------------
  const generarPDF = () => {
    exportarPDFCajas(cajas, null, fechaInicio, fechaFin);
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-4">📊 Reporte / Historial de Cajas</h3>

      {/* Filtros */}
      <div className="card p-3 mb-4 shadow-sm">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Fecha inicio:</label>
            <input
              type="date"
              className="form-control"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Fecha fin:</label>
            <input
              type="date"
              className="form-control"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div className="col-md-4 d-flex gap-2">
            <button className="btn btn-primary w-50" onClick={filtrarPorFechas}>
              🔍 Buscar
            </button>
            <button className="btn btn-danger w-50" onClick={generarPDF}>
              📄 Descargar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-responsive shadow-sm">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-dark text-center">
            <tr>
              <th>#</th>
              <th>Usuario Apertura</th>
              <th>Fecha Apertura</th>
              <th>Fecha Cierre</th>
              <th>Monto Inicial (Q)</th>
              <th>Total Ventas (Q)</th>
              <th>Monto Final (Q)</th>
              <th>Estado</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {loading ? (
              <tr>
                <td colSpan="9">Cargando datos...</td>
              </tr>
            ) : cajas.length > 0 ? (
              cajas.map((caja, index) => {
                const montoInicial = Number(caja.monto_inicial) || 0;
                const totalVentas = Number(caja.total_ventas) || 0;
                const montoFinal = caja.monto_final !== null ? Number(caja.monto_final) : null;
                return (
                  <tr key={caja.idcaja}>
                    <td>{index + 1}</td>
                    <td>{caja.usuario_apertura || "—"}</td>
                    <td>{formatearFecha(caja.fecha_apertura)}</td>
                    <td>{formatearFecha(caja.fecha_cierre)}</td>
                    <td>Q{montoInicial.toFixed(2)}</td>
                    <td>Q{totalVentas.toFixed(2)}</td>
                    <td>{montoFinal !== null ? `Q${montoFinal.toFixed(2)}` : "—"}</td>
                    <td>
                      {caja.estado ? (
                        <span className="badge bg-success">Abierta</span>
                      ) : (
                        <span className="badge bg-danger">Cerrada</span>
                      )}
                    </td>
                    <td>{caja.observaciones || "—"}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9">No hay registros disponibles.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReporteCajas;
