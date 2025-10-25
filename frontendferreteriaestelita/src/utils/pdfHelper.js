import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generarPDFVenta = (venta, logoBase64) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ------------------------
  // Encabezado
  // ------------------------
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 15, 10, 30, 30);
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("FERRETERÍA LA ESTELITA", 50, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("NIT: 12345678", 50, 27);
  doc.text("Dirección: Caserio Cooperativa, Aldea El Tablon", 50, 32);
  doc.text("Tel: (502) 1234-5678", 50, 37);
  doc.text("Correo: contacto@laestelita.com", 50, 42);

  // ------------------------
  // Datos del cliente en recuadro
  // ------------------------
  const leftX = 15;
  const rightX = pageWidth / 2 + 20;
  const topY = 55;
  const boxHeight = 25;

  // Recuadro
  doc.setDrawColor(0);
  doc.rect(leftX - 2, topY - 5, pageWidth - 30, boxHeight);

  // Factura y fecha
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Factura No: ${venta.numeroFactura}`, leftX, topY);
  const fechaLocal = new Date(venta.fecha);
  fechaLocal.setHours(fechaLocal.getHours() + 6); // Ajusta UTC-6 (Guatemala)
  doc.text(`Fecha: ${fechaLocal.toLocaleDateString("es-GT")}`, rightX, topY);

  // Datos del cliente
  doc.setFont("helvetica", "normal");
  doc.text(`Cliente: ${venta.cliente.nombre || "Consumidor Final"}`, leftX, topY + 10);
  doc.text(`NIT: ${venta.cliente.nit || "CF"}`, leftX, topY + 16);
  doc.text(`Dirección: ${venta.cliente.direccion || "-"}`, rightX, topY + 10);
  doc.text(`Teléfono: ${venta.cliente.telefono || "-"}`, rightX, topY + 16);

  // ------------------------
  // Tabla de productos
  // ------------------------
  const body = venta.productos.map((p, index) => {
    const subtotal = (p.precio_venta * p.cantidad) - (p.descuento || 0);
    return [
      index + 1,
      p.codigo || "-",
      p.nombre || "-",
      p.cantidad,
      `Q${Number(p.precio_venta).toFixed(2)}`,
      `Q${Number(p.descuento || 0).toFixed(2)}`,
      `Q${subtotal.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: topY + boxHeight + 5,
    head: [["#", "Código", "Producto", "Cantidad", "Precio Unit.", "Descuento", "Subtotal"]],
    body: body,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10 },
    margin: { left: 10, right: 10 },
    columnStyles: {
      3: { halign: "center" }, // Cantidad centrada
      4: { halign: "right" },  // Precio unitario a la derecha
      5: { halign: "right" },  // Descuento a la derecha
      6: { halign: "right" },  // Subtotal a la derecha
    },
  });

  // ------------------------
  // Totales
  // ------------------------
  const finalY = doc.lastAutoTable.finalY || (topY + boxHeight + 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL: Q${Number(venta.total).toFixed(2)}`, rightX, finalY + 10);
  doc.text(`Recibido: Q${Number(venta.montorecibido || venta.total).toFixed(2)}`, rightX, finalY + 16);
  doc.text(`Vuelto: Q${Number(venta.vuelto || 0).toFixed(2)}`, rightX, finalY + 22);

  // ------------------------
  // Pie de página
  // ------------------------
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("¡Gracias por su compra!", leftX, pageHeight - 10);

  doc.save(`venta_${venta.numeroFactura}.pdf`);
};
