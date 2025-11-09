import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Alert } from "react-bootstrap";
import { debounce } from "lodash";
import { obtenerCategorias, crearCategoria } from "../services/categoriaService";
import { obtenerProveedores, crearProveedor } from "../services/proveedorService";
import { obtenerProductoPorCodigo } from "../services/productoService";
import axios from "axios";
import Swal from "sweetalert2";
import "@sweetalert2/theme-bootstrap-4/bootstrap-4.min.css";
import { generarPDFCompra } from "../utils/pdfCompras";
import logo from "../assets/ESTELITA.jpeg";

const Compra = () => {
  // ESTADOS PRINCIPALES
  const [proveedor, setProveedor] = useState("");
  const [fechaCompra, setFechaCompra] = useState("");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [compraGuardada, setCompraGuardada] = useState(null);

  // MODALES
  const [showModalProducto, setShowModalProducto] = useState(false);
  const [showModalProveedor, setShowModalProveedor] = useState(false);

  // PRODUCTO
  const [producto, setProducto] = useState({
    idproducto: null,
    codigo: "",
    idcategoria: "",
    nombreCategoria: "",
    nombre: "",
    bulto: "",
    detalle: "",
    presentacion: "",
    observaciones: "",
    fecha_vencimiento: "",
    cantidad: "",
    precio: "",
    precio_venta: "",
    descuento: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [nuevaCategoria, setNuevaCategoria] = useState(false);

  // PROVEEDOR
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: "",
    telefono: "",
    nit: "",
    direccion: "",
    email: "",
  });

  // ALERTAS
  const [alertProducto, setAlertProducto] = useState("");
  const [alertProveedor, setAlertProveedor] = useState("");
  const [alertCompra, setAlertCompra] = useState("");

  // LIMPIAR ALERTAS AUTOMÁTICAMENTE
  useEffect(() => {
    if (alertProducto) setTimeout(() => setAlertProducto(""), 3000);
    if (alertProveedor) setTimeout(() => setAlertProveedor(""), 3000);
    if (alertCompra) setTimeout(() => setAlertCompra(""), 3000);
  }, [alertProducto, alertProveedor, alertCompra]);

  // CARGAR CATEGORÍAS Y PROVEEDORES
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catData = await obtenerCategorias();
        setCategorias(catData);
        const provData = await obtenerProveedores();
        setProveedores(provData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  const getCategoriaNombre = (id) =>
    categorias.find((c) => c.idcategoria === Number(id))?.nombre || "";

  const calcularSubtotal = (p) =>
    (Number(p.cantidad) || 0) * (Number(p.precio) || 0) -
    (Number(p.descuento) || 0);

  const totalGeneral = productos.reduce(
    (acc, p) => acc + calcularSubtotal(p),
    0
  );

  // AUTOCOMPLETAR PRODUCTO POR CÓDIGO
  const autocompletarProductoDebounce = debounce(async (codigo) => {
    if (!codigo || codigo.length < 3) return;
    try {
      const prod = await obtenerProductoPorCodigo(codigo);
      if (prod) {
        setProducto((prev) => ({
          ...prev,
          idproducto: prod.idproducto,
          nombre: prod.nombre,
          idcategoria: prod.idcategoria,
          nombreCategoria: getCategoriaNombre(prod.idcategoria),
          bulto: prod.bulto || "",
          detalle: prod.detalle || "",
          presentacion: prod.presentacion || "",
          observaciones: prod.observaciones || "",
          precio: prev.precio || prod.preciocompra || 0,
          precio_venta: prev.precio_venta || prod.precioventa || 0,
          fecha_vencimiento: prod.fecha_vencimiento || "",
          cantidad: prev.cantidad || "",
          descuento: prev.descuento || 0,
        }));
      } else {
        setProducto((prev) => ({
          ...prev,
          idproducto: null,
          nombre: "",
          idcategoria: "",
          nombreCategoria: "",
          bulto: "",
          detalle: "",
          presentacion: "",
          observaciones: "",
          precio: "",
          precio_venta: "",
          fecha_vencimiento: "",
        }));
      }
    } catch (e) {
      console.error("Error obteniendo producto:", e);
    }
  }, 500);

  // AGREGAR / EDITAR PRODUCTO
  const handleAgregarProducto = () => {
    if (!proveedor) {
      setAlertCompra("Seleccione un proveedor antes de agregar productos.");
      return;
    }
    setEditIndex(null);
    setProducto({
      idproducto: null,
      codigo: "",
      idcategoria: "",
      nombreCategoria: "",
      nombre: "",
      bulto: "",
      detalle: "",
      presentacion: "",
      observaciones: "",
      fecha_vencimiento: "",
      cantidad: "",
      precio: "",
      precio_venta: "",
      descuento: "",
    });
    setNuevaCategoria(false);
    setShowModalProducto(true);
  };

  const handleGuardarProducto = async () => {
    if (
      !producto.codigo ||
      !producto.nombre ||
      (!producto.idcategoria && !producto.nombreCategoria)
    ) {
      setAlertProducto("Complete código, nombre y categoría.");
      return;
    }
    if (
      (Number(producto.cantidad) || 0) <= 0 ||
      (Number(producto.precio) || 0) <= 0
    ) {
      setAlertProducto("Cantidad y precio deben ser mayores a 0.");
      return;
    }

    let idcategoriaFinal = producto.idcategoria;
    let nombreCategoriaFinal = producto.nombreCategoria;

    // Crear nueva categoría si es necesario
    if (!editIndex && nuevaCategoria && producto.nombreCategoria.trim() !== "") {
      try {
        const nueva = await crearCategoria({ nombre: producto.nombreCategoria });
        idcategoriaFinal = nueva.idcategoria;
        nombreCategoriaFinal = nueva.nombre;
        setCategorias([...categorias, nueva]);
      } catch (e) {
        setAlertProducto("No se pudo crear la categoría.");
        return;
      }
    }

    const productoFinal = {
      ...producto,
      idcategoria: idcategoriaFinal,
      nombreCategoria: nombreCategoriaFinal || getCategoriaNombre(idcategoriaFinal),
    };

    if (editIndex !== null) {
      const nuevos = [...productos];
      nuevos[editIndex] = productoFinal;
      setProductos(nuevos);
    } else {
      if (productos.some((p) => p.codigo === productoFinal.codigo)) {
        setAlertProducto("Este producto ya está agregado.");
        return;
      }
      setProductos([...productos, productoFinal]);
    }

    setShowModalProducto(false);
  };

  const handleEditarProducto = (index) => {
    setEditIndex(index);
    setProducto(productos[index]);
    setNuevaCategoria(false);
    setShowModalProducto(true);
  };

  const handleEliminarProducto = (index) => {
    if (window.confirm("¿Desea eliminar este producto?"))
      setProductos(productos.filter((_, i) => i !== index));
  };

  // GUARDAR NUEVO PROVEEDOR
  const handleGuardarProveedor = async () => {
    if (!nuevoProveedor.nombre) {
      setAlertProveedor("Ingrese el nombre del proveedor.");
      return;
    }
    try {
      const nuevo = await crearProveedor(nuevoProveedor);
      setProveedores([...proveedores, nuevo]);
      setProveedor(nuevo.idprov);
      setShowModalProveedor(false);
      setNuevoProveedor({
        nombre: "",
        telefono: "",
        nit: "",
        direccion: "",
        email: "",
      });
    } catch (e) {
      setAlertProveedor("No se pudo crear el proveedor.");
    }
  };

  // CONFIRMAR Y GUARDAR COMPRA
  const handleConfirmarCompra = () => {
    if (!proveedor || productos.length === 0) {
      setAlertCompra("Seleccione proveedor y agregue productos.");
      return;
    }
    if (!fechaCompra) {
      setAlertCompra("Seleccione fecha de compra.");
      return;
    }

    Swal.fire({
      title: "¿Está seguro de guardar la compra?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, Guardar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) handleGuardarCompra();
    });
  };

// URL dinámica según entorno
const API_URL = import.meta.env.VITE_API_URL;

  const handleGuardarCompra = async () => {
    try {
      const idusuario = localStorage.getItem("idusuario");
      const res = await axios.post(`${API_URL}/compras`, {
        idprov: proveedor,
        idusuario,
        fecha: fechaCompra,
        total: totalGeneral,
        productos,
      });

      const compraAPI = res.data.compra;

      const nuevaCompra = {
        numeroCompra: compraAPI.numerocompra,
        fecha: compraAPI.fecha || fechaCompra,
        proveedor: proveedores.find((p) => p.idprov === Number(proveedor)) || {},
        productos,
        total: totalGeneral,
        idusuario: compraAPI.idusuario,
      };

      setProductos([]);
      setFechaCompra("");
      setProveedor("");
      setCompraGuardada(nuevaCompra);

      Swal.fire({
        title: "Compra Exitosa",
        text: `Compra ${compraAPI.numerocompra} registrada correctamente`,
        icon: "success",
      });
    } catch (e) {
      console.error("Error guardar compra:", e);
      setAlertCompra("No se pudo registrar la compra.");
      
      Swal.fire({
      title: "Error",
      text: "No se pudo registrar la compra. Verifica los datos o la conexión.",
      icon: "error",
    });
    }
  };

  // GENERAR PDF
  const generarPDF = async () => {
    if (!compraGuardada) return;
    const response = await fetch(logo);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onloadend = () => {
      const logoBase64 = reader.result;
      generarPDFCompra(compraGuardada, logoBase64);
    };
    reader.readAsDataURL(blob);
  };

  return (
    <div className="container mt-4">
      <h3>COMPRA</h3>
      {alertCompra && (
        <Alert variant="warning" onClose={() => setAlertCompra("")} dismissible>
          {alertCompra}
        </Alert>
      )}

      <div className="d-flex align-items-center mb-3">
        <Form.Select
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
          className="me-2"
        >
          <option value="">Seleccione proveedor</option>
          {proveedores.map((p) => (
            <option key={p.idprov} value={p.idprov}>
              {p.nombre}
            </option>
          ))}
        </Form.Select>
        <Button
          variant="primary"
          className="me-2"
          onClick={() => setShowModalProveedor(true)}
        >
          + Nuevo Proveedor
        </Button>
        <Button
          variant="success"
          onClick={handleAgregarProducto}
          className="me-2"
        >
          + Añadir producto
        </Button>
        <Form.Control
          type="date"
          value={fechaCompra}
          onChange={(e) => setFechaCompra(e.target.value)}
          style={{ maxWidth: "200px" }}
        />
      </div>

      <Table striped bordered hover>
        <thead className="table-success">
          <tr>
            <th>Código</th>
            <th>Categoría</th>
            <th>Producto</th>
            <th>Bulto</th>
            <th>Detalle</th>
            <th>Presentación</th>
            <th>Observaciones</th>
            <th>Fecha Vencimiento</th>
            <th>Cantidad</th>
            <th>Precio Compra</th>
            <th>Precio Venta</th>
            <th>Descuento</th>
            <th>Subtotal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="14" className="text-center">
                No hay productos agregados
              </td>
            </tr>
          ) : (
            productos.map((p, index) => (
              <tr key={index}>
                <td>{p.codigo}</td>
                <td>{p.nombreCategoria}</td>
                <td>{p.nombre}</td>
                <td>{p.bulto}</td>
                <td>{p.detalle}</td>
                <td>{p.presentacion}</td>
                <td>{p.observaciones}</td>
                <td>{p.fecha_vencimiento}</td>
                <td>{p.cantidad}</td>
                <td>{p.precio}</td>
                <td>{p.precio_venta}</td>
                <td>{p.descuento}</td>
                <td>{calcularSubtotal(p).toFixed(2)}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditarProducto(index)}
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleEliminarProducto(index)}
                  >
                    🗑️
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-end align-items-center mb-3">
        <strong className="me-2">Precio total:</strong>
        <Form.Control
          type="text"
          value={totalGeneral.toFixed(2)}
          readOnly
          style={{ maxWidth: "150px" }}
        />
      </div>

      <Button variant="success" className="mb-4" onClick={handleConfirmarCompra}>
        Guardar Compra
      </Button>
      <Button
        variant="secondary"
        className="mb-4 ms-2"
        disabled={!compraGuardada}
        onClick={generarPDF}
      >
        Imprimir
      </Button>

      {/* MODAL PRODUCTO */}
      <Modal show={showModalProducto} onHide={() => setShowModalProducto(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editIndex !== null ? "Editar producto" : "Agregar producto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alertProducto && (
            <Alert
              variant="warning"
              onClose={() => setAlertProducto("")}
              dismissible
            >
              {alertProducto}
            </Alert>
          )}
          <Form>
            {/* Código */}
            <Form.Group className="mb-2">
              <Form.Label>Código</Form.Label>
              <Form.Control
                value={producto.codigo}
                onChange={(e) => {
                  setProducto({ ...producto, codigo: e.target.value });
                  if (!editIndex) autocompletarProductoDebounce(e.target.value);
                }}
                readOnly={editIndex !== null}
              />
            </Form.Group>

            {/* Categoría */}
            <Form.Group className="mb-2">
              <Form.Label>Categoría</Form.Label>
              <div className="d-flex">
                {nuevaCategoria ? (
                  <Form.Control
                    value={producto.nombreCategoria}
                    onChange={(e) =>
                      setProducto({ ...producto, nombreCategoria: e.target.value })
                    }
                    placeholder="Ingrese nueva categoría"
                  />
                ) : (
                  <Form.Select
                    value={producto.idcategoria}
                    onChange={(e) => {
                      const idcat = e.target.value;
                      setProducto({
                        ...producto,
                        idcategoria: idcat,
                        nombreCategoria: getCategoriaNombre(idcat),
                      });
                    }}
                  >
                    <option value="">Seleccione categoría</option>
                    {categorias.map((c) => (
                      <option key={c.idcategoria} value={c.idcategoria}>
                        {c.nombre}
                      </option>
                    ))}
                  </Form.Select>
                )}
                {!editIndex && (
                  <Button
                    variant={nuevaCategoria ? "secondary" : "primary"}
                    className="ms-2"
                    onClick={() => setNuevaCategoria(!nuevaCategoria)}
                  >
                    {nuevaCategoria ? "Cancelar" : "+ Nueva Categoría"}
                  </Button>
                )}
              </div>
            </Form.Group>

            {/* Datos del producto */}
            <Form.Group className="mb-2">
              <Form.Label>Producto</Form.Label>
              <Form.Control
                value={producto.nombre}
                onChange={(e) =>
                  setProducto({ ...producto, nombre: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Bulto</Form.Label>
              <Form.Control
                value={producto.bulto}
                onChange={(e) =>
                  setProducto({ ...producto, bulto: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Detalle</Form.Label>
              <Form.Control
                value={producto.detalle}
                onChange={(e) =>
                  setProducto({ ...producto, detalle: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Presentación</Form.Label>
              <Form.Control
                value={producto.presentacion}
                onChange={(e) =>
                  setProducto({ ...producto, presentacion: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                value={producto.observaciones}
                onChange={(e) =>
                  setProducto({ ...producto, observaciones: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Fecha Vencimiento</Form.Label>
              <Form.Control
                type="date"
                value={producto.fecha_vencimiento}
                onChange={(e) =>
                  setProducto({
                    ...producto,
                    fecha_vencimiento: e.target.value,
                  })
                }
              />
            </Form.Group>

            {/* Cantidad, precios y descuento */}
            <Form.Group className="mb-2">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={producto.cantidad}
                onChange={(e) =>
                  setProducto({
                    ...producto,
                    cantidad: e.target.value.replace("-", ""),
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Precio Compra</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={producto.precio}
                onChange={(e) =>
                  setProducto({
                    ...producto,
                    precio: e.target.value.replace("-", ""),
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Precio Venta</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={producto.precio_venta}
                onChange={(e) =>
                  setProducto({
                    ...producto,
                    precio_venta: e.target.value.replace("-", ""),
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Descuento</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={producto.descuento}
                onChange={(e) =>
                  setProducto({
                    ...producto,
                    descuento: e.target.value.replace("-", ""),
                  })
                }
              />
            </Form.Group>

            <div className="text-end mt-2">
              <strong>Subtotal: {calcularSubtotal(producto).toFixed(2)}</strong>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalProducto(false)}
          >
            Cancelar
          </Button>
          <Button variant="success" onClick={handleGuardarProducto}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL PROVEEDOR */}
      <Modal show={showModalProveedor} onHide={() => setShowModalProveedor(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Proveedor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alertProveedor && (
            <Alert
              variant="warning"
              onClose={() => setAlertProveedor("")}
              dismissible
            >
              {alertProveedor}
            </Alert>
          )}
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={nuevoProveedor.nombre}
                onChange={(e) =>
                  setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                value={nuevoProveedor.telefono}
                onChange={(e) =>
                  setNuevoProveedor({
                    ...nuevoProveedor,
                    telefono: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>NIT</Form.Label>
              <Form.Control
                value={nuevoProveedor.nit}
                onChange={(e) =>
                  setNuevoProveedor({ ...nuevoProveedor, nit: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                value={nuevoProveedor.direccion}
                onChange={(e) =>
                  setNuevoProveedor({
                    ...nuevoProveedor,
                    direccion: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={nuevoProveedor.email}
                onChange={(e) =>
                  setNuevoProveedor({ ...nuevoProveedor, email: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModalProveedor(false)}
          >
            Cancelar
          </Button>
          <Button variant="success" onClick={handleGuardarProveedor}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Compra;
