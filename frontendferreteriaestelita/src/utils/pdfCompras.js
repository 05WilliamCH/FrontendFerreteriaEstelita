import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generarPDFCompra = (compra, logoBase64) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // -----------------------------
  // ENCABEZADO
  // -----------------------------
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 15, 10, 30, 30);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FERRETERÍA LA ESTELITA", 50, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("NIT: 12345678", 50, 27);
  doc.text("Dirección: Caserío Cooperativa, Aldea El Tablón, Sololá", 50, 32);
  doc.text("Tel: (502) 1234-5678", 50, 37);
  doc.text("Correo: contacto@laestelita.com", 50, 42);

  // -----------------------------
  // DATOS DE LA COMPRA
  // -----------------------------
  const leftX = 15;
  const rightX = pageWidth / 2 + 20;
  const topY = 55;
  const boxHeight = 25;

  doc.setDrawColor(0);
  doc.rect(leftX - 2, topY - 5, pageWidth - 30, boxHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Compra No: ${compra.numeroCompra}`, leftX, topY);
  const fechaLocal = new Date(compra.fecha);
  fechaLocal.setHours(fechaLocal.getHours() + 6);
  doc.text(`Fecha: ${fechaLocal.toLocaleDateString("es-GT")}`, rightX, topY);

  const prov = compra.proveedor || {};
  doc.setFont("helvetica", "normal");
  doc.text(`Proveedor: ${prov.nombre || "-"}`, leftX, topY + 10);
  doc.text(`NIT: ${prov.nit || "-"}`, leftX, topY + 16);
  doc.text(`Teléfono: ${prov.telefono || "-"}`, rightX, topY + 10);
  doc.text(`Dirección: ${prov.direccion || "-"}`, rightX, topY + 16);

  // -----------------------------
  // DETALLE DE PRODUCTOS
  // -----------------------------
  const body = compra.productos.map((p, i) => {
    const subtotal = (Number(p.cantidad) * Number(p.precio)) - (Number(p.descuento) || 0);
    return [
      i + 1,
      p.codigo || "-",
      p.nombre || "-",
      p.nombreCategoria || "-",
      p.cantidad,
      `Q${Number(p.precio).toFixed(2)}`,
      `Q${Number(p.descuento || 0).toFixed(2)}`,
      `Q${subtotal.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: topY + boxHeight + 5,
    head: [["#", "Código", "Producto", "Categoría", "Cantidad", "Precio Unit.", "Descuento", "Subtotal"]],
    body,
    theme: "grid",
    headStyles: { fillColor: [40, 167, 69], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 10, right: 10 },
    columnStyles: {
      4: { halign: "center" },
      5: { halign: "right" },
      6: { halign: "right" },
      7: { halign: "right" },
    },
  });

  // -----------------------------
  // TOTAL
  // -----------------------------
  const finalY = doc.lastAutoTable.finalY || (topY + boxHeight + 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`TOTAL COMPRA: Q${Number(compra.total).toFixed(2)}`, rightX, finalY + 10);

  // -----------------------------
  // PIE DE PÁGINA
  // -----------------------------
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text("Gracias por confiar en Ferretería La Estelita", leftX, pageHeight - 10);

  // Descargar PDF
  doc.save(`compra_${compra.numeroCompra}.pdf`);
};
