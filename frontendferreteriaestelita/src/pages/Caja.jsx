import React, { useEffect, useState } from "react";
import {
  abrirCaja,
  cerrarCaja,
  obtenerEstadoCaja,
} from "../services/cajaService";
import Swal from "sweetalert2";

const Caja = () => {
  const [estadoCaja, setEstadoCaja] = useState(null);
  const [montoInicial, setMontoInicial] = useState("");
  const [montoFinal, setMontoFinal] = useState("");
  const [idusuario, setIdusuario] = useState(1); // Cambiar según login real

  useEffect(() => {
    cargarEstadoCaja();
  }, []);

  const cargarEstadoCaja = async () => {
    const data = await obtenerEstadoCaja();
    setEstadoCaja(data);
  };

  const handleAbrirCaja = async () => {
    try {
      if (!montoInicial) return Swal.fire("Atención", "Ingrese un monto inicial", "warning");

      const res = await abrirCaja({
        idusuario,
        monto_inicial: parseFloat(montoInicial),
      });

      Swal.fire("Éxito", res.message, "success");
      setMontoInicial("");
      cargarEstadoCaja();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Error al abrir caja", "error");
    }
  };

  const handleCerrarCaja = async () => {
    try {
      if (!montoFinal) return Swal.fire("Atención", "Ingrese el monto final", "warning");

      const res = await cerrarCaja({
        idusuario,
        monto_final: parseFloat(montoFinal),
      });

      Swal.fire("Caja cerrada", `Diferencia: Q${res.diferencia}`, "info");
      setMontoFinal("");
      cargarEstadoCaja();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Error al cerrar caja", "error");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-3">💰 Control de Caja - Ferretería La Estelita</h2>

      {estadoCaja?.abierta ? (
        <div className="card p-3 shadow">
          <h5>Caja Abierta</h5>
          <p><strong>Fecha Apertura:</strong> {new Date(estadoCaja.caja.fecha_apertura).toLocaleString()}</p>
          <p><strong>Monto Inicial:</strong> Q{estadoCaja.caja.monto_inicial}</p>
          <hr />

          <div className="mb-3">
            <label className="form-label">Monto Final (Efectivo actual)</label>
            <input
              type="number"
              className="form-control"
              value={montoFinal}
              onChange={(e) => setMontoFinal(e.target.value)}
              placeholder="Ingrese monto contado"
            />
          </div>

          <button className="btn btn-danger w-100" onClick={handleCerrarCaja}>
            🔒 Cerrar Caja
          </button>
        </div>
      ) : (
        <div className="card p-3 shadow">
          <h5>No hay caja abierta</h5>
          <div className="mb-3">
            <label className="form-label">Monto Inicial</label>
            <input
              type="number"
              className="form-control"
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value)}
              placeholder="Ingrese monto de apertura"
            />
          </div>

          <button className="btn btn-success w-100" onClick={handleAbrirCaja}>
            🟢 Abrir Caja
          </button>
        </div>
      )}
    </div>
  );
};

export default Caja;
