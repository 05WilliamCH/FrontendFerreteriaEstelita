import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// 📌 Generar PDF de la venta
export const generarPDFVenta = (venta, logoBase64) => {
  const doc = new jsPDF();

  // ------------------------
  // ENCABEZADO
  // ------------------------
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 15, 10, 30, 30); // logo en esquina
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("FERRETERÍA LA ESTELITA", 50, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("NIT: 12345678", 50, 27);
  doc.text("Dirección: Caserio Cooperativa, Aldea El Tablon", 50, 32);
  doc.text("Tel: (502) 1234-5678", 50, 37);
  doc.text("Correo: contacto@laestelita.com", 50, 42);

  // ------------------------
  // DATOS DE VENTA
  // ------------------------
  doc.setFontSize(12);
  doc.text(`Factura No: ${venta.numeroFactura || "001-0001"}`, 15, 55);
  doc.text(`Fecha: ${venta.fecha}`, 150, 55);
  doc.text(`Cliente: ${venta.cliente || "Consumidor Final"}`, 15, 65);

  // ------------------------
  // TABLA DE PRODUCTOS
  // ------------------------
  const body = venta.productos.map((p, index) => [
    index + 1,
    p.nombre,
    p.cantidad,
    `Q${p.precio.toFixed(2)}`,
    `Q${(p.cantidad * p.precio).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 75,
    head: [["#", "Producto", "Cantidad", "Precio Unitario", "Subtotal"]],
    body: body,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] }, // Azul bonito
    styles: { fontSize: 10 },
  });

  // ------------------------
  // TOTAL
  // ------------------------
  const finalY = doc.lastAutoTable.finalY || 75;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL: Q${venta.total.toFixed(2)}`, 150, finalY + 10);

  // ------------------------
  // PIE DE PÁGINA
  // ------------------------
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("¡Gracias por su compra!", 15, 285);

  doc.save(`venta_${venta.numeroFactura || "factura"}.pdf`);
};
