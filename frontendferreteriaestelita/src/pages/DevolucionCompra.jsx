import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  crearDevolucionCompra,
  obtenerCompraPorNumero
} from "../services/devolucionCompraService";

const DevolucionCompraForm = () => {
  const [numerocompra, setNumerocompra] = useState("");
  const [productos, setProductos] = useState([]);
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario")) || { idusuario: 1 };

  // 🔹 Cargar productos de la compra
  const cargarProductos = async () => {
    if (!numerocompra.trim()) return Swal.fire("Atención", "Ingrese un número de compra válido", "warning");

    try {
      setLoading(true);
      const res = await obtenerCompraPorNumero(numerocompra.trim());
      const data = Array.isArray(res.data) ? res.data : [];

      if (data.length === 0) {
        Swal.fire("Sin resultados", "No se encontraron productos para esta compra", "info");
        setProductos([]);
        return;
      }

      const productosConCantidad = data.map(p => ({
        ...p,
        cantidad_devolver: 0,
        max_devolver: parseFloat(p.cantidad) - parseFloat(p.devuelta)
      }));

      setProductos(productosConCantidad);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      Swal.fire("Error", "Ocurrió un error al cargar los productos", "error");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Ajustar cantidad con botones + / -
  const ajustarCantidad = (index, delta) => {
    const updated = [...productos];
    let nuevaCantidad = updated[index].cantidad_devolver + delta;
    if (nuevaCantidad < 0) nuevaCantidad = 0;
    if (nuevaCantidad > updated[index].max_devolver) nuevaCantidad = updated[index].max_devolver;
    updated[index].cantidad_devolver = nuevaCantidad;
    setProductos(updated);
  };

  // 🔹 Total devolución
  const totalDevolucion = productos.reduce(
    (acc, p) => acc + p.cantidad_devolver * parseFloat(p.precio_unitario),
    0
  );

  // 🔹 Enviar devolución al backend (con confirmación)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const productosADevolver = productos
      .filter(p => p.cantidad_devolver > 0)
      .map(p => ({
        idproducto: p.idproducto,
        cantidad: p.cantidad_devolver,
        precio: parseFloat(p.precio_unitario)
      }));

    if (productosADevolver.length === 0)
      return Swal.fire("Atención", "Seleccione al menos un producto a devolver", "warning");
    if (!motivo.trim())
      return Swal.fire("Atención", "Ingrese un motivo de devolución", "warning");

    // ⚠️ Confirmación antes de registrar
    const confirm = await Swal.fire({
      title: "¿Registrar devolución?",
      html: `
        <p><strong>Número de compra:</strong> ${numerocompra}</p>
        <p><strong>Total a devolver:</strong> Q. ${totalDevolucion.toFixed(2)}</p>
        <p><strong>Motivo:</strong> ${motivo}</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#198754",
      cancelButtonColor: "#dc3545"
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      const res = await crearDevolucionCompra({
        numerocompra: numerocompra.trim(),
        idusuario: usuario.idusuario,
        motivo: motivo.trim(),
        productos: productosADevolver
      });

      Swal.fire("Éxito", `Devolución registrada correctamente`, "success");

      // 🔹 Limpiar formulario
      setNumerocompra("");
      setProductos([]);
      setMotivo("");
    } catch (error) {
      console.error("Error al crear devolución:", error);
      Swal.fire("Error", error.response?.data?.error || "No se pudo registrar la devolución", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2>Registrar Devolución de Compra</h2>

      {/* Número de compra */}
      <div className="mb-3">
        <label>Número de compra:</label>
        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Ingrese número de compra..."
            value={numerocompra}
            onChange={e => setNumerocompra(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={cargarProductos}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Cargar Productos"}
          </button>
        </div>
      </div>

      {/* Tabla de productos */}
      {productos.length > 0 && (
        <form onSubmit={handleSubmit}>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad Comprada</th>
                <th>Devuelta</th>
                <th>Máx a devolver</th>
                <th>Cantidad a devolver</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p, idx) => (
                <tr key={p.idproducto}>
                  <td>{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td>{p.cantidad}</td>
                  <td>{p.devuelta}</td>
                  <td>{p.max_devolver}</td>
                  <td className="d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary me-1"
                      onClick={() => ajustarCantidad(idx, -1)}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      style={{ width: "70px" }}
                      value={p.cantidad_devolver}
                      min="0"
                      max={p.max_devolver}
                      readOnly
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary ms-1"
                      onClick={() => ajustarCantidad(idx, 1)}
                    >
                      +
                    </button>
                  </td>
                  <td>{(p.cantidad_devolver * parseFloat(p.precio_unitario)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <h5>Total devolución: Q. {totalDevolucion.toFixed(2)}</h5>

          {/* Motivo */}
          <div className="mb-3">
            <label>Motivo de la devolución:</label>
            <textarea
              className="form-control"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? "Procesando..." : "Registrar Devolución"}
          </button>
        </form>
      )}
    </div>
  );
};

export default DevolucionCompraForm;
