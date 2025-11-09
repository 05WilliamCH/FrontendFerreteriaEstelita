const API_URL = `${import.meta.env.VITE_API_URL}/proveedores`;

// Obtener todos los proveedores
export const obtenerProveedores = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener proveedores");
  return await res.json();
};

// Crear proveedor
export const crearProveedor = async (proveedor) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedor),
  });
  if (!res.ok) throw new Error("Error al crear proveedor");
  return await res.json();
};

// Actualizar proveedor
export const actualizarProveedor = async (id, proveedor) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedor),
  });
  if (!res.ok) throw new Error("Error al actualizar proveedor");
  return await res.json();
};

// Eliminar proveedor
export const eliminarProveedor = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar proveedor");
  return await res.json();
};
