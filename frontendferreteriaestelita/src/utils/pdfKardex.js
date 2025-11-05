import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generarPDFKardex = (kardex, filtros, logoBase64) => {
  const doc = new jsPDF("l", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

 // -----------------------------
// ENCABEZADO
// -----------------------------
if (logoBase64) {
  doc.addImage(logoBase64, "PNG", 25, 15, 40, 40);
}

doc.setFont("helvetica", "bold");
doc.setFontSize(16);
doc.text("FERRETERÍA LA ESTELITA", 75, 25);

doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.text("Dirección: Caserío Cooperativa, Aldea El Tablón, Sololá", 75, 32);
doc.text("Tel: (502) 5436-3645", 75, 38);
doc.text("Correo: contacto@laestelita.com", 75, 44);

doc.setFont("helvetica", "bold");
doc.setFontSize(13);
doc.text("REPORTE DE KARDEX DE MOVIMIENTOS", pageWidth / 2, 70, {
  align: "center",
});
  // -----------------------------
  // FILTROS APLICADOS
  // -----------------------------
  const topY = 85;
  const boxHeight = 35;
  doc.setDrawColor(0);
  doc.rect(20, topY - 8, pageWidth - 40, boxHeight);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Fecha Inicio: ${filtros.fechaInicio || "-"}`, 30, topY);
  doc.text(`Fecha Fin: ${filtros.fechaFin || "-"}`, 180, topY);
  doc.text(`Usuario: ${filtros.idusuario || "Todos"}`, 330, topY);
  doc.text(`Categoría: ${filtros.idcategoria || "Todas"}`, 470, topY);
  doc.text(`Búsqueda: ${filtros.busqueda || "-"}`, 650, topY);

  // -----------------------------
  // TABLA DE MOVIMIENTOS
  // -----------------------------
  const body = kardex.map((item, i) => [
    i + 1,
    item.codigo || "-",
    item.producto || "-",
    item.categoria || "-",
    new Date(item.fecha_movimiento).toLocaleDateString("es-GT"),
    item.usuario || "-",
    item.tipo_movimiento || "-",
    item.numerodocumento || item.numerofactura || "—",
    item.cantidad || 0,
    `Q${Number(item.precio || 0).toFixed(2)}`,
    // `Q${Number(item.total || 0).toFixed(2)}`,
    item.stock || 0,
  ]);

  autoTable(doc, {
    startY: topY + boxHeight + 10,
    head: [
      [
        "#",
        "Código",
        "Producto",
        "Categoría",
        "Fecha",
        "Usuario",
        "Movimiento",
        "Número Doc.",
        "Cantidad",
        "Precio (Q)",
        // "Total (Q)",
        "Stock Disponible",
      ],
    ],
    body,
    theme: "grid",
    headStyles: { fillColor: [52, 58, 64], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { halign: "center", cellWidth: 25 },
      1: { cellWidth: 65 },
      2: { cellWidth: 120 },
      3: { cellWidth: 80 },
      4: { cellWidth: 70 },
      5: { cellWidth: 90 },
      6: { cellWidth: 70, halign: "center" },
      7: { halign: "center", cellWidth: 50 },
      8: { halign: "right", cellWidth: 65 },
      9: { halign: "right", cellWidth: 65 },
      10: { halign: "center", cellWidth: 50 },
    },
    margin: { left: 15, right: 15 },
  });

  // -----------------------------
  // PIE DE PÁGINA
  // -----------------------------
  const finalY = doc.lastAutoTable.finalY || 750;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text(
    "Generado automáticamente por el Sistema de Inventario | Ferretería La Estelita",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );

  // -----------------------------
  // GUARDAR PDF
  // -----------------------------
  doc.save("Reporte_Kardex.pdf");
};
