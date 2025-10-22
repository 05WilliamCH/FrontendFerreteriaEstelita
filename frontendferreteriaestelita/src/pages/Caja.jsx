import React, { useEffect, useState } from "react";
import { abrirCaja, cerrarCaja, obtenerEstadoCaja } from "../services/cajaService";
import Swal from "sweetalert2";

const Caja = () => {
  const [estadoCaja, setEstadoCaja] = useState(null);
  const [montoInicial, setMontoInicial] = useState("");
  const [montoFinal, setMontoFinal] = useState("");
  const [diferencia, setDiferencia] = useState(0);
  const [idusuario, setIdusuario] = useState(1); // Cambiar según login real

  useEffect(() => {
    cargarEstadoCaja();
  }, []);

  useEffect(() => {
    // Calcular diferencia en tiempo real solo si hay caja abierta
    if (estadoCaja?.abierta && montoFinal !== "") {
      const totalEsperado =
        parseFloat(estadoCaja.caja.monto_inicial) +
        parseFloat(estadoCaja.caja.total_ventas || 0);
      setDiferencia(parseFloat(montoFinal) - totalEsperado);
    } else {
      setDiferencia(0);
    }
  }, [montoFinal, estadoCaja]);

  const cargarEstadoCaja = async () => {
    const data = await obtenerEstadoCaja();
    console.log("Estado Caja:", data);
    setEstadoCaja(data);
  };

  const handleAbrirCaja = async () => {
    try {
      if (!montoInicial)
        return Swal.fire("Atención", "Ingrese un monto inicial", "warning");

      const res = await abrirCaja({
        idusuario,
        monto_inicial: parseFloat(montoInicial),
      });

      Swal.fire("Éxito", res.message, "success");
      setMontoInicial("");
      cargarEstadoCaja();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "Error al abrir caja",
        "error"
      );
    }
  };

  const handleCerrarCaja = async () => {
    try {
      if (!montoFinal)
        return Swal.fire("Atención", "Ingrese el monto final", "warning");

      const res = await cerrarCaja({
        idusuario,
        monto_final: parseFloat(montoFinal),
      });

      Swal.fire({
        title: "Caja cerrada",
        html: `
          <p><strong>Usuario Apertura:</strong> ${estadoCaja.caja.usuario_apertura}</p>
          <p><strong>Fecha Apertura:</strong> ${new Date(
            estadoCaja.caja.fecha_apertura
          ).toLocaleString()}</p>
          <p><strong>Fecha Cierre:</strong> ${new Date(
            res.fecha_cierre
          ).toLocaleString()}</p>
          <p><strong>Monto Inicial:</strong> Q${estadoCaja.caja.monto_inicial}</p>
          <p><strong>Total Ventas:</strong> Q${estadoCaja.caja.total_ventas}</p>
          <p><strong>Monto Final:</strong> Q${montoFinal}</p>
          <p><strong>Diferencia:</strong> Q${diferencia.toFixed(2)}</p>
        `,
        icon: "info",
      });

      setMontoFinal("");
      setDiferencia(0);
      cargarEstadoCaja();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.error || "Error al cerrar caja",
        "error"
      );
    }
  };

  // Determinar si la caja está cerrada
  const cajaCerrada = estadoCaja?.caja?.estado === false;

  // Determinar color de la diferencia
  const colorDiferencia =
    diferencia > 0 ? "green" : diferencia < 0 ? "red" : "orange";

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-3">💰 Control de Caja - Ferretería La Estelita</h2>

      <div className="card p-3 shadow">
        {estadoCaja?.abierta ? (
          <>
            <h5>Caja Abierta</h5>
            <p>
              <strong>Usuario Apertura:</strong>{" "}
              {estadoCaja.caja.usuario_apertura}
            </p>
            <p>
              <strong>Fecha Apertura:</strong>{" "}
              {new Date(estadoCaja.caja.fecha_apertura).toLocaleString()}
            </p>
            <p>
              <strong>Total Ventas:</strong> Q{estadoCaja.caja.total_ventas}
            </p>
            <p>
              <strong>Monto Inicial:</strong> Q{estadoCaja.caja.monto_inicial}
            </p>
            <hr />

            <div className="mb-3">
              <label className="form-label">Monto Final (Efectivo actual)</label>
              <input
                type="number"
                className="form-control"
                value={montoFinal}
                onChange={(e) => setMontoFinal(e.target.value)}
                placeholder="Ingrese monto contado"
                disabled={cajaCerrada}
              />
            </div>

            <p>
              <strong>Diferencia:</strong>{" "}
              <span style={{ color: colorDiferencia }}>
                Q{diferencia.toFixed(2)}
              </span>
            </p>

            <button
              className="btn btn-danger w-100"
              onClick={handleCerrarCaja}
              disabled={cajaCerrada}
            >
              🔒 Cerrar Caja
            </button>
          </>
        ) : (
          <>
            <h5>{cajaCerrada ? "Caja Cerrada" : "No hay caja abierta"}</h5>
            {estadoCaja?.caja?.fecha_cierre && (
              <p>
                <strong>Fecha Cierre:</strong>{" "}
                {new Date(estadoCaja.caja.fecha_cierre).toLocaleString()}
              </p>
            )}

            <div className="mb-3">
              <label className="form-label">Monto Inicial</label>
              <input
                type="number"
                className="form-control"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                placeholder="Ingrese monto de apertura"
                disabled={cajaCerrada}
              />
            </div>

            <button
              className="btn btn-success w-100"
              onClick={handleAbrirCaja}
              disabled={cajaCerrada}
            >
              🟢 Abrir Caja
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Caja;
