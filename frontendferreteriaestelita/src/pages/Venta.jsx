import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Alert } from "react-bootstrap";
import { debounce } from "lodash";
import { obtenerCategorias } from "../services/categoriaService";
import { obtenerClientes, crearCliente } from "../services/clienteService";
import { obtenerProductoPorCodigo } from "../services/productoService";
import { crearVenta } from "../services/ventaService";
import Swal from "sweetalert2";
import "@sweetalert2/theme-bootstrap-4/bootstrap-4.min.css";
import { generarPDFVenta } from "../utils/pdfHelper";
import logo from "../assets/ESTELITA.jpeg";

const Venta = () => {
  const [cliente, setCliente] = useState("");
  const [fechaVenta, setFechaVenta] = useState("");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ventaActiva, setVentaActiva] = useState(null);
  const [montoRecibido, setMontoRecibido] = useState("");
  const [vuelto, setVuelto] = useState(0);

  // ----- MODALES -----
  const [showModalProducto, setShowModalProducto] = useState(false);
  const [showModalCliente, setShowModalCliente] = useState(false);

  // ----- PRODUCTO -----
  const [producto, setProducto] = useState({
    idproducto: null,
    codigo: "",
    idcategoria: "",
    nombreCategoria: "",
    nombre: "",
    bulto: "",
    detalle: "",
    cantidad: "",
    precio_venta: "",
    descuento: "",
  });
  const [editIndex, setEditIndex] = useState(null);

  // ----- CLIENTE -----
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    telefono: "",
    nit: "",
    direccion: "",
    email: "",
  });

  // ----- ALERTAS -----
  const [alertProducto, setAlertProducto] = useState("");
  const [alertCliente, setAlertCliente] = useState("");
  const [alertVenta, setAlertVenta] = useState("");

  // =========================
  // ALERTAS AUTOMÁTICAS
  // =========================
  useEffect(() => {
    if (alertProducto) setTimeout(() => setAlertProducto(""), 3000);
    if (alertCliente) setTimeout(() => setAlertCliente(""), 3000);
    if (alertVenta) setTimeout(() => setAlertVenta(""), 3000);
  }, [alertProducto, alertCliente, alertVenta]);

  // =========================
  // Cargar Categorías y Clientes
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catData = await obtenerCategorias();
        setCategorias(catData);
        const cliData = await obtenerClientes();
        setClientes(cliData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  // =========================
  // Funciones auxiliares
  // =========================
  const getCategoriaNombre = (id) => {
    const cat = categorias.find((c) => c.idcategoria === Number(id));
    return cat ? cat.nombre : "";
  };

  const calcularSubtotal = (p) =>
    (Number(p.cantidad) || 0) * (Number(p.precio_venta) || 0) -
    (Number(p.descuento) || 0);

  const totalGeneral = productos.reduce(
    (acc, p) => acc + calcularSubtotal(p),
    0
  );

  const calcularVuelto = (monto) => {
    const montoNum = Number(monto) || 0;
    const vueltoCalc = montoNum - totalGeneral;
    setVuelto(vueltoCalc >= 0 ? vueltoCalc : 0);
  };

  // =========================
  // Autocompletar producto
  // =========================
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
          bulto: prod.bulto,
          detalle: prod.detalle,
          precio_venta: prod.precio_venta,
        }));
      }
    } catch (error) {
      console.error("Error obteniendo producto:", error);
    }
  }, 500);

  // =========================
  // PRODUCTOS
  // =========================
  const handleAgregarProducto = () => {
    if (!cliente) {
      setAlertVenta("Seleccione un cliente antes de agregar productos.");
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
      cantidad: "",
      precio_venta: "",
      descuento: "",
    });
    setAlertProducto("");
    setShowModalProducto(true);
  };

  const handleGuardarProducto = () => {
    if (!producto.codigo || !producto.nombre) {
      setAlertProducto("Complete código y nombre.");
      return;
    }
    if ((Number(producto.cantidad) || 0) <= 0) {
      setAlertProducto("Cantidad debe ser mayor a 0.");
      return;
    }

    if (editIndex !== null) {
      const nuevos = [...productos];
      nuevos[editIndex] = producto;
      setProductos(nuevos);
    } else {
      if (productos.some((p) => p.codigo === producto.codigo)) {
        setAlertProducto("Este producto ya está agregado.");
        return;
      }
      setProductos([...productos, producto]);
    }
    setShowModalProducto(false);
  };

  const handleEditarProducto = (index) => {
    setEditIndex(index);
    setProducto(productos[index]);
    setAlertProducto("");
    setShowModalProducto(true);
  };

  const handleEliminarProducto = (index) => {
    if (window.confirm("¿Desea eliminar este producto?")) {
      setProductos(productos.filter((_, i) => i !== index));
    }
  };

  // =========================
  // CLIENTE
  // =========================
  const handleGuardarCliente = async () => {
    if (!nuevoCliente.nombre) {
      setAlertCliente("Ingrese el nombre del cliente.");
      return;
    }
    try {
      const nuevo = await crearCliente(nuevoCliente);
      setClientes([...clientes, nuevo]);
      setCliente(nuevo.idcliente);
      setShowModalCliente(false);
      setNuevoCliente({
        nombre: "",
        telefono: "",
        nit: "",
        direccion: "",
        email: "",
      });
    } catch (error) {
      setAlertCliente("No se pudo crear el cliente.");
    }
  };

  // =========================
  // VENTA con SweetAlert2
  // =========================
  const handleConfirmarVenta = () => {
    if (!cliente || productos.length === 0) {
      setAlertVenta("Seleccione cliente y agregue productos.");
      return;
    }
    if (!fechaVenta) {
      setAlertVenta("Seleccione fecha de venta.");
      return;
    }
    if (Number(montoRecibido) < totalGeneral) {
      setAlertVenta("El monto recibido es menor al total de la venta.");
      return;
    }

    Swal.fire({
      title: "¿Está seguro de guardar la venta?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, Guardar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) handleGuardarVenta();
    });
  };

  const handleGuardarVenta = async () => {
    try {
      const ventaCreada = await crearVenta({
        idcliente: cliente,
        fecha: fechaVenta,
        productos,
        montorecibido: Number(montoRecibido),
        vuelto: Number(vuelto),
      });

      setVentaActiva(ventaCreada.venta);

      Swal.fire({
        title: "Venta Exitosa",
        text: "La venta se ha registrado correctamente",
        icon: "success",
        confirmButtonText: "Aceptar",
        customClass: { confirmButton: "btn btn-success" },
        buttonsStyling: false,
      });

      setProductos([]);
      setCliente("");
      setFechaVenta("");
      setMontoRecibido("");
      setVuelto(0);
    } catch (error) {
      setAlertVenta("No se pudo registrar la venta.");
      console.error(error);
    }
  };

  // ----- PDF y SAT -----
  const handleImprimir = () => {
  if (!ventaActiva) return;

  const ventaPDF = {
    numeroFactura: ventaActiva.numeroFactura || ventaActiva.idventa.toString().padStart(6, "0"),
    cliente: ventaActiva.cliente || { nombre: "Consumidor Final", nit: "CF", direccion: "Ciudad", telefono: "-" },
    fecha: ventaActiva.fecha || new Date().toISOString().slice(0, 10),
    productos: ventaActiva.productos.map((p) => ({
      codigo: p.codigo || "-",
      nombre: p.nombre,
      cantidad: Number(p.cantidad),
      precio_venta: Number(p.precio_venta),
      descuento: Number(p.descuento || 0),
      subtotal: Number(p.cantidad) * Number(p.precio_venta) - Number(p.descuento || 0),
    })),
    total: Number(ventaActiva.total),
    montoRecibido: Number(montoRecibido),
    vuelto: Number(vuelto),
  };

  const img = new Image();
  img.src = logo;
  img.onload = () => generarPDFVenta(ventaPDF, img.src);
};


  const handleRedirigirSAT = () => {
    window.open("https://portal.sat.gob.gt/", "_blank");
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="container mt-4">
      <h3>VENTA</h3>

      {alertVenta && (
        <Alert variant="warning" onClose={() => setAlertVenta("")} dismissible>
          {alertVenta}
        </Alert>
      )}

      <div className="d-flex align-items-center mb-3">
        <Form.Select
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="me-2"
        >
          <option value="">Seleccione cliente</option>
          {clientes.map((c) => (
            <option key={c.idcliente} value={c.idcliente}>
              {c.nombre}
            </option>
          ))}
        </Form.Select>
        <Button variant="primary" className="me-2" onClick={() => setShowModalCliente(true)}>
          + Nuevo Cliente
        </Button>
        <Button variant="success" className="me-2" onClick={handleAgregarProducto}>
          + Añadir producto
        </Button>
        <Form.Control
          type="date"
          value={fechaVenta}
          onChange={(e) => setFechaVenta(e.target.value)}
          style={{ maxWidth: "200px" }}
        />
      </div>

      {/* TABLA PRODUCTOS */}
      <Table striped bordered hover>
        <thead className="table-success">
          <tr>
            <th>CÓDIGO</th>
            <th>CATEGORÍA</th>
            <th>PRODUCTO</th>
            <th>CANTIDAD</th>
            <th>PRECIO VENTA</th>
            <th>DESCUENTO</th>
            <th>SUBTOTAL</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No hay productos agregados
              </td>
            </tr>
          ) : (
            productos.map((p, i) => (
              <tr key={i}>
                <td>{p.codigo}</td>
                <td>{p.nombreCategoria}</td>
                <td>{p.nombre}</td>
                <td>{p.cantidad}</td>
                <td>Q{p.precio_venta}</td>
                <td>Q{p.descuento}</td>
                <td>Q{calcularSubtotal(p).toFixed(2)}</td>
                <td>
                  <Button variant="outline-primary" size="sm" onClick={() => handleEditarProducto(i)}>
                    ✏️
                  </Button>{" "}
                  <Button variant="outline-danger" size="sm" onClick={() => handleEliminarProducto(i)}>
                    🗑️
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* TOTAL Y VUELTO */}
      <div className="d-flex flex-column align-items-end mb-3" style={{ maxWidth: "300px", marginLeft: "auto" }}>
        <Form.Group className="d-flex align-items-center gap-2 mb-2 w-100">
          <Form.Label className="m-0">Total:</Form.Label>
          <Form.Control type="text" value={`Q${totalGeneral.toFixed(2)}`} readOnly />
        </Form.Group>

        <Form.Group className="d-flex align-items-center gap-2 mb-2 w-100">
          <Form.Label className="m-0">Monto recibido:</Form.Label>
          <Form.Control
            type="number"
            value={montoRecibido}
            min="0"
            onChange={(e) => {
              setMontoRecibido(e.target.value);
              calcularVuelto(e.target.value);
            }}
          />
        </Form.Group>

        <Form.Group className="d-flex align-items-center gap-2 w-100">
          <Form.Label className="m-0">Vuelto:</Form.Label>
          <Form.Control type="text" value={`Q${vuelto.toFixed(2)}`} readOnly />
        </Form.Group>
      </div>

      <Button variant="success" className="mb-3" onClick={handleConfirmarVenta}>
        Guardar Venta
      </Button>

      <div className="d-flex gap-2 mb-4">
        <Button variant="danger" onClick={handleImprimir}>
          🖨️ Imprimir PDF
        </Button>
        <Button variant="primary" onClick={handleRedirigirSAT}>
          🌐 Ir a SAT
        </Button>
      </div>

      {/* MODAL PRODUCTO */}
      <Modal
        show={showModalProducto}
        onHide={() => setShowModalProducto(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editIndex !== null ? "Editar producto" : "Agregar producto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alertProducto && (
            <Alert variant="warning" onClose={() => setAlertProducto("")} dismissible>
              {alertProducto}
            </Alert>
          )}
          <Form>
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
            <Form.Group className="mb-2">
              <Form.Label>Categoría</Form.Label>
              <Form.Control value={producto.nombreCategoria} readOnly />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Producto</Form.Label>
              <Form.Control value={producto.nombre} readOnly />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Bulto</Form.Label>
              <Form.Control value={producto.bulto} readOnly />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Detalle</Form.Label>
              <Form.Control value={producto.detalle} readOnly />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={producto.cantidad}
                onChange={(e) =>
                  setProducto({ ...producto, cantidad: e.target.value.replace("-", "") })
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
                  setProducto({ ...producto, precio_venta: e.target.value.replace("-", "") })
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
                  setProducto({ ...producto, descuento: e.target.value.replace("-", "") })
                }
              />
            </Form.Group>
            <div className="text-end mt-2">
              <strong>Subtotal: {calcularSubtotal(producto).toFixed(2)}</strong>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalProducto(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleGuardarProducto}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL CLIENTE */}
      <Modal
        show={showModalCliente}
        onHide={() => setShowModalCliente(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alertCliente && (
            <Alert variant="warning" onClose={() => setAlertCliente("")} dismissible>
              {alertCliente}
            </Alert>
          )}
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={nuevoCliente.nombre}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                value={nuevoCliente.telefono}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>NIT</Form.Label>
              <Form.Control
                value={nuevoCliente.nit}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, nit: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                value={nuevoCliente.direccion}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={nuevoCliente.email}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalCliente(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleGuardarCliente}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Venta;
