// src/pages/Inventario.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Form, Spinner, Alert } from "react-bootstrap";
import {
  obtenerProductos,
  actualizarPrecioVenta,
} from "../services/productoService";

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [mensaje, setMensaje] = useState(null);

  // Cargar productos al iniciar
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await obtenerProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar nuevo precio
  const guardarPrecio = async (id) => {
    try {
      await actualizarPrecioVenta(id, { precio_venta: parseFloat(nuevoPrecio) });
      setMensaje({ tipo: "success", texto: "Precio actualizado correctamente" });
      setEditingId(null);
      cargarProductos();
    } catch (error) {
      setMensaje({ tipo: "danger", texto: "Error al actualizar precio" });
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Agregar Precio de Productos</h2>

      {mensaje && (
        <Alert
          variant={mensaje.tipo}
          dismissible
          onClose={() => setMensaje(null)}
        >
          {mensaje.texto}
        </Alert>
      )}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Proveedor</th>
              <th>Stock</th>
              <th>Precio Venta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((prod, index) => (
              <tr key={prod.idproducto}>
                <td>{index + 1}</td>
                <td>{prod.codigo}</td>
                <td>{prod.nombre}</td>
                <td>{prod.categoria}</td>
                <td>{prod.proveedor}</td>
                <td>{prod.stock}</td>
                <td>
                  {editingId === prod.idproducto ? (
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={nuevoPrecio}
                      onChange={(e) => setNuevoPrecio(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    `Q. ${prod.precio_venta || 0}`
                  )}
                </td>
                <td>
                  {editingId === prod.idproducto ? (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => guardarPrecio(prod.idproducto)}
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => {
                        setEditingId(prod.idproducto);
                        setNuevoPrecio(prod.precio_venta || 0);
                      }}
                    >
                      Editar Precio
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default Inventario;
