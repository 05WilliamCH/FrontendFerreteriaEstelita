import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import axios from "axios";

const Compra = () => {
  const [proveedor, setProveedor] = useState("");
  const [fechaCompra, setFechaCompra] = useState("");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [nuevaCategoria, setNuevaCategoria] = useState(false);

  // Proveedores
  const [proveedores, setProveedores] = useState([]);
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState({ nombre: "", telefono: "", nit: "", direccion: "", email: "" });

  // Producto en modal
  const [producto, setProducto] = useState({
    idproducto: null,
    codigo: "",
    idcategoria: "",
    nombreCategoria: "",
    nombre: "",
    bulto: "",
    detalle: "",
    cantidad: 0,
    precio: 0,
    descuento: 0,
  });

  // Cargar categorías y proveedores
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/categorias");
        setCategorias(res.data);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      }
    };
    const fetchProveedores = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/proveedores");
        setProveedores(res.data);
      } catch (error) {
        console.error("Error cargando proveedores:", error);
      }
    };
    fetchCategorias();
    fetchProveedores();
  }, []);

  // Abrir modal de producto
  const handleShow = () => {
    setEditIndex(null);
    setProducto({
      idproducto: null,
      codigo: "",
      idcategoria: "",
      nombreCategoria: "",
      nombre: "",
      bulto: "",
      detalle: "",
      cantidad: 0,
      precio: 0,
      descuento: 0,
    });
    setNuevaCategoria(false);
    setShowModal(true);
  };

  // Guardar producto en la lista
  const handleSaveProducto = async () => {
    if (!producto.codigo || (!producto.idcategoria && !producto.nombreCategoria) || !producto.nombre) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }
    if (producto.cantidad <= 0 || producto.precio <= 0) {
      alert("Cantidad y precio deben ser mayores a 0.");
      return;
    }

    let idcategoriaFinal = producto.idcategoria;
    let nombreCategoriaFinal = producto.nombreCategoria;

    if (nuevaCategoria && producto.nombreCategoria.trim() !== "") {
      try {
        const res = await axios.post("http://localhost:3000/api/categorias", {
          nombre: producto.nombreCategoria,
        });
        idcategoriaFinal = res.data.idcategoria;
        nombreCategoriaFinal = res.data.nombre;
        setCategorias([...categorias, res.data]);
      } catch (error) {
        console.error("Error creando categoría:", error);
        alert("No se pudo crear la categoría");
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
      setProductos([...productos, productoFinal]);
    }

    setShowModal(false);
  };

  const getCategoriaNombre = (id) => {
    const cat = categorias.find((c) => c.idcategoria === Number(id));
    return cat ? cat.nombre : "";
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setProducto(productos[index]);
    setNuevaCategoria(false);
    setShowModal(true);
  };

  const handleDelete = (index) => {
    if (window.confirm("¿Desea eliminar este producto?")) {
      setProductos(productos.filter((_, i) => i !== index));
    }
  };

  const calcularSubtotal = (p) => p.cantidad * p.precio - (p.descuento || 0);
  const totalGeneral = productos.reduce((acc, p) => acc + calcularSubtotal(p), 0);

  // Guardar nuevo proveedor
  const handleGuardarProveedor = async () => {
    if (!nuevoProveedor.nombre) {
      alert("Complete los datos del proveedor.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:3000/api/proveedores", nuevoProveedor);
      setProveedores([...proveedores, res.data]);
      setProveedor(res.data.idprov); // seleccionar automáticamente
      setShowProveedorModal(false);
      setNuevoProveedor({ nombre: "", telefono: "", nit: "", direccion: "", email: "" });
    } catch (error) {
      console.error("Error creando proveedor:", error);
    }
  };

  // Guardar toda la compra
  const handleGuardarCompra = async () => {
    if (!proveedor || productos.length === 0) {
      alert("Seleccione proveedor y agregue productos");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/compras", {
        idprov: proveedor,
        fecha: fechaCompra,
        total: totalGeneral,
        productos,
      });
      alert(res.data.message);
      setProductos([]);
    } catch (error) {
      console.error("Error al crear compra:", error);
      alert("No se pudo registrar la compra");
    }
  };

  return (
    <div className="container mt-4">
      <h3>COMPRA</h3>

      <div className="d-flex align-items-center mb-3">
        <Form.Select value={proveedor} onChange={(e) => setProveedor(e.target.value)} className="me-2">
          <option value="">Seleccione proveedor</option>
          {proveedores.map((p) => (
            <option key={p.idprov} value={p.idprov}>{p.nombre}</option>
          ))}
        </Form.Select>
        <Button variant="primary" className="me-2" onClick={() => setShowProveedorModal(true)}>
          + Nuevo Proveedor
        </Button>
        <Button variant="success" onClick={handleShow} className="me-2">
          + Añadir producto
        </Button>
        <Form.Control type="date" value={fechaCompra} onChange={(e) => setFechaCompra(e.target.value)} style={{ maxWidth: "200px" }}/>
      </div>

      <Table striped bordered hover>
        <thead className="table-success">
          <tr>
            <th>CÓDIGO</th>
            <th>CATEGORÍA</th>
            <th>PRODUCTO</th>
            <th>BULTO</th>
            <th>DETALLE</th>
            <th>CANTIDAD</th>
            <th>PRECIO</th>
            <th>DESCUENTO</th>
            <th>SUBTOTAL</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr><td colSpan="10" className="text-center">No hay productos agregados</td></tr>
          ) : productos.map((p, index) => (
            <tr key={index}>
              <td>{p.codigo}</td>
              <td>{p.nombreCategoria}</td>
              <td>{p.nombre}</td>
              <td>{p.bulto}</td>
              <td>{p.detalle}</td>
              <td>{p.cantidad}</td>
              <td>{p.precio}</td>
              <td>{p.descuento}</td>
              <td>{calcularSubtotal(p).toFixed(2)}</td>
              <td>
                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(index)}>✏️</Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(index)}>🗑️</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-end align-items-center">
        <strong className="me-2">Precio total:</strong>
        <Form.Control type="text" value={totalGeneral.toFixed(2)} readOnly style={{ maxWidth: "150px" }}/>
      </div>

      <Button className="mt-3" variant="success" onClick={handleGuardarCompra}>Guardar Compra</Button>

      {/* Modal producto */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editIndex !== null ? "Editar producto" : "Agregar producto"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Código</Form.Label>
              <Form.Control value={producto.codigo} onChange={(e) => setProducto({ ...producto, codigo: e.target.value })}/>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Categoría</Form.Label>
              {!nuevaCategoria ? (
                <Form.Select
                  value={producto.idcategoria}
                  onChange={(e) => {
                    if (e.target.value === "new") {
                      setNuevaCategoria(true);
                      setProducto({ ...producto, idcategoria: "", nombreCategoria: "" });
                    } else {
                      setProducto({
                        ...producto,
                        idcategoria: e.target.value,
                        nombreCategoria: getCategoriaNombre(e.target.value),
                      });
                    }
                  }}
                >
                  <option value="">Seleccione categoría</option>
                  {categorias.map((c) => <option key={c.idcategoria} value={c.idcategoria}>{c.nombre}</option>)}
                  <option value="new">➕ Nueva categoría</option>
                </Form.Select>
              ) : (
                <div className="d-flex">
                  <Form.Control placeholder="Nueva categoría" value={producto.nombreCategoria} onChange={(e) => setProducto({ ...producto, nombreCategoria: e.target.value })}/>
                  <Button variant="secondary" className="ms-2" onClick={() => setNuevaCategoria(false)}>Cancelar</Button>
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Producto</Form.Label>
              <Form.Control value={producto.nombre} onChange={(e) => setProducto({ ...producto, nombre: e.target.value })}/>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Bulto</Form.Label>
              <Form.Control value={producto.bulto} onChange={(e) => setProducto({ ...producto, bulto: e.target.value })}/>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Detalle</Form.Label>
              <Form.Control value={producto.detalle} onChange={(e) => setProducto({ ...producto, detalle: e.target.value })}/>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control type="number" value={producto.cantidad} onChange={(e) => setProducto({ ...producto, cantidad: Number(e.target.value) })}/>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Precio</Form.Label>
              <Form.Control type="number" value={producto.precio} onChange={(e) => setProducto({ ...producto, precio: Number(e.target.value) })}/>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Descuento</Form.Label>
              <Form.Control type="number" value={producto.descuento} onChange={(e) => setProducto({ ...producto, descuento: Number(e.target.value) })}/>
            </Form.Group>

            <div className="text-end">
              <strong>Subtotal: {calcularSubtotal(producto).toFixed(2)}</strong>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleSaveProducto}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal proveedor */}
      <Modal show={showProveedorModal} onHide={() => setShowProveedorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Proveedor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={nuevoProveedor.nombre} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })}/>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Telefono</Form.Label>
              <Form.Control value={nuevoProveedor.telefono} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })}/>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Nit</Form.Label>
              <Form.Control value={nuevoProveedor.nit} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nit: e.target.value })}/>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Direccion</Form.Label>
              <Form.Control value={nuevoProveedor.direccion} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, direccion: e.target.value })}/>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control value={nuevoProveedor.email} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, email: e.target.value })}/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProveedorModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleGuardarProveedor}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Compra;
