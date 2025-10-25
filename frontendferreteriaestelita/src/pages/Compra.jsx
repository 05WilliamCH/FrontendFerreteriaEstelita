import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Alert } from "react-bootstrap";
import { debounce } from "lodash";
import {
  obtenerCategorias,
  crearCategoria,
} from "../services/categoriaService";
import {
  obtenerProveedores,
  crearProveedor,
} from "../services/proveedorService";
import { obtenerProductoPorCodigo } from "../services/productoService";
import axios from "axios";
import Swal from "sweetalert2";
import "@sweetalert2/theme-bootstrap-4/bootstrap-4.min.css";

const Compra = () => {
  const [proveedor, setProveedor] = useState("");
  const [fechaCompra, setFechaCompra] = useState("");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  // ----- MODALES -----
  const [showModalProducto, setShowModalProducto] = useState(false);
  const [showModalProveedor, setShowModalProveedor] = useState(false);

  // ----- PRODUCTO -----
  const [producto, setProducto] = useState({
    idproducto: null,
    codigo: "",
    idcategoria: "",
    nombreCategoria: "",
    nombre: "",
    bulto: "",
    detalle: "",
    fecha_vencimiento: "",
    cantidad: "",
    precio: "",
    descuento: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [nuevaCategoria, setNuevaCategoria] = useState(false);

  // ----- PROVEEDOR -----
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: "",
    telefono: "",
    nit: "",
    direccion: "",
    email: "",
  });

  // ----- ALERTAS -----
  const [alertProducto, setAlertProducto] = useState("");
  const [alertProveedor, setAlertProveedor] = useState("");
  const [alertCompra, setAlertCompra] = useState("");

  // =========================
  // ALERTAS AUTOMÁTICAS
  // =========================
  useEffect(() => {
    if (alertProducto) {
      const timer = setTimeout(() => setAlertProducto(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertProducto]);

  useEffect(() => {
    if (alertProveedor) {
      const timer = setTimeout(() => setAlertProveedor(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertProveedor]);

  useEffect(() => {
    if (alertCompra) {
      const timer = setTimeout(() => setAlertCompra(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertCompra]);

  // =========================
  // Cargar Categorías y Proveedores
  // =========================
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

  // =========================
  // Funciones auxiliares
  // =========================
  const getCategoriaNombre = (id) => {
    const cat = categorias.find((c) => c.idcategoria === Number(id));
    return cat ? cat.nombre : "";
  };

  const calcularSubtotal = (p) =>
    (Number(p.cantidad) || 0) * (Number(p.precio) || 0) - (Number(p.descuento) || 0);

  const totalGeneral = productos.reduce(
    (acc, p) => acc + calcularSubtotal(p),
    0
  );

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
          precio: prev.precio || prod.precio,
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
          precio: prev.precio || 0,
          fecha_vencimiento: "",
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
      fecha_vencimiento: "",
      cantidad: "",
      precio: "",
      descuento: "",
    });
    setNuevaCategoria(false);
    setAlertProducto("");
    setShowModalProducto(true);
  };

  const handleGuardarProducto = async () => {
    if (!producto.codigo || !producto.nombre || (!producto.idcategoria && !producto.nombreCategoria)) {
      setAlertProducto("Complete código, nombre y categoría.");
      return;
    }
    if ((Number(producto.cantidad) || 0) <= 0 || (Number(producto.precio) || 0) <= 0) {
      setAlertProducto("Cantidad y precio deben ser mayores a 0.");
      return;
    }

    let idcategoriaFinal = producto.idcategoria;
    let nombreCategoriaFinal = producto.nombreCategoria;

    if (!editIndex && nuevaCategoria && producto.nombreCategoria.trim() !== "") {
      try {
        const nueva = await crearCategoria({ nombre: producto.nombreCategoria });
        idcategoriaFinal = nueva.idcategoria;
        nombreCategoriaFinal = nueva.nombre;
        setCategorias([...categorias, nueva]);
      } catch (error) {
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
      nuevos[editIndex] = {
        ...nuevos[editIndex],
        cantidad: productoFinal.cantidad,
        precio: productoFinal.precio,
        descuento: productoFinal.descuento,
      };
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
    setAlertProducto("");
    setShowModalProducto(true);
  };

  const handleEliminarProducto = (index) => {
    if (window.confirm("¿Desea eliminar este producto?")) {
      setProductos(productos.filter((_, i) => i !== index));
    }
  };

  // =========================
  // PROVEEDOR
  // =========================
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
      setNuevoProveedor({ nombre: "", telefono: "", nit: "", direccion: "", email: "" });
      setAlertProveedor("");
    } catch (error) {
      setAlertProveedor("No se pudo crear el proveedor.");
    }
  };

  // =========================
  // COMPRA con SweetAlert2
  // =========================
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
      reverseButtons: true,
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        handleGuardarCompra();
      }
    });
  };

  const handleGuardarCompra = async () => {
    try {
       const idusuario = localStorage.getItem("idusuario"); // 👈 agregar esto

      await axios.post("http://localhost:3000/api/compras", {
        idprov: proveedor,
        idusuario, // 👈 enviarlo al backend
        fecha: fechaCompra,
        total: totalGeneral,
        productos,
      });
      setProductos([]);
      setFechaCompra("");
      setProveedor("");
      setAlertCompra("");

      Swal.fire({
        title: "Compra Exitosa",
        text: "La compra se ha registrado correctamente",
        icon: "success",
        confirmButtonText: "Aceptar",
        customClass: {
          confirmButton: "btn btn-success",
        },
        buttonsStyling: false,
      });
    } catch (error) {
      setAlertCompra("No se pudo registrar la compra.");
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="container mt-4">
      <h3>COMPRA</h3>

      {alertCompra && <Alert variant="warning" onClose={() => setAlertCompra("")} dismissible>{alertCompra}</Alert>}

      <div className="d-flex align-items-center mb-3">
        <Form.Select
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
          className="me-2"
        >
          <option value="">Seleccione proveedor</option>
          {proveedores.map((p) => (
            <option key={p.idprov} value={p.idprov}>{p.nombre}</option>
          ))}
        </Form.Select>
        <Button variant="primary" className="me-2" onClick={() => setShowModalProveedor(true)}>+ Nuevo Proveedor</Button>
        <Button variant="success" onClick={handleAgregarProducto} className="me-2">+ Añadir producto</Button>
        <Form.Control type="date" value={fechaCompra} onChange={(e) => setFechaCompra(e.target.value)} style={{ maxWidth: "200px" }} />
      </div>

      {/* TABLA PRODUCTOS */}
      <Table striped bordered hover>
        <thead className="table-success">
          <tr>
            <th>CÓDIGO</th>
            <th>CATEGORÍA</th>
            <th>PRODUCTO</th>
            <th>BULTO</th>
            <th>DETALLE</th>
            <th>FECHA VENCIMIENTO</th>
            <th>CANTIDAD</th>
            <th>PRECIO</th>
            <th>DESCUENTO</th>
            <th>SUBTOTAL</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="11" className="text-center">No hay productos agregados</td>
            </tr>
          ) : productos.map((p, index) => (
            <tr key={index}>
              <td>{p.codigo}</td>
              <td>{p.nombreCategoria}</td>
              <td>{p.nombre}</td>
              <td>{p.bulto}</td>
              <td>{p.detalle}</td>
              <td>{p.fecha_vencimiento}</td>
              <td>{p.cantidad}</td>
              <td>{p.precio}</td>
              <td>{p.descuento}</td>
              <td>{calcularSubtotal(p).toFixed(2)}</td>
              <td>
                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditarProducto(index)}>✏️</Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleEliminarProducto(index)}>🗑️</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-end align-items-center mb-3">
        <strong className="me-2">Precio total:</strong>
        <Form.Control type="text" value={totalGeneral.toFixed(2)} readOnly style={{ maxWidth: "150px" }} />
      </div>

      <Button variant="success" className="mb-4" onClick={handleConfirmarCompra}>Guardar Compra</Button>

      {/* MODAL PRODUCTO */}
      <Modal show={showModalProducto} onHide={() => setShowModalProducto(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editIndex !== null ? "Editar producto" : "Agregar producto"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alertProducto && <Alert variant="warning" onClose={() => setAlertProducto("")} dismissible>{alertProducto}</Alert>}
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
                <div className="d-flex">
                  {nuevaCategoria ? (
                    <Form.Control
                      value={producto.nombreCategoria}
                      onChange={(e) => setProducto({ ...producto, nombreCategoria: e.target.value })}
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

            <Form.Group className="mb-2">
              <Form.Label>Producto</Form.Label>
              <Form.Control
                value={producto.nombre}
                readOnly={editIndex !== null}
                onChange={(e) => setProducto({ ...producto, nombre: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Bulto</Form.Label>
              <Form.Control
                value={producto.bulto}
                readOnly={editIndex !== null}
                onChange={(e) => setProducto({ ...producto, bulto: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Detalle</Form.Label>
              <Form.Control
                value={producto.detalle}
                readOnly={editIndex !== null}
                onChange={(e) => setProducto({ ...producto, detalle: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Fecha Vencimiento</Form.Label>
              <Form.Control
                type="date"
                value={producto.fecha_vencimiento}
                readOnly={editIndex !== null}
                onChange={(e) => setProducto({ ...producto, fecha_vencimiento: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={producto.cantidad}
                onChange={(e) => setProducto({ ...producto, cantidad: e.target.value.replace("-", "") })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={producto.precio}
                onChange={(e) => setProducto({ ...producto, precio: e.target.value.replace("-", "") })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Descuento</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={producto.descuento}
                onChange={(e) => setProducto({ ...producto, descuento: e.target.value.replace("-", "") })}
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

      {/* MODAL PROVEEDOR */}
      <Modal show={showModalProveedor} onHide={() => setShowModalProveedor(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Proveedor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alertProveedor && <Alert variant="warning" onClose={() => setAlertProveedor("")} dismissible>{alertProveedor}</Alert>}
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={nuevoProveedor.nombre} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control value={nuevoProveedor.telefono} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>NIT</Form.Label>
              <Form.Control value={nuevoProveedor.nit} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nit: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Dirección</Form.Label>
              <Form.Control value={nuevoProveedor.direccion} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, direccion: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control value={nuevoProveedor.email} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, email: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalProveedor(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleGuardarProveedor}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Compra;