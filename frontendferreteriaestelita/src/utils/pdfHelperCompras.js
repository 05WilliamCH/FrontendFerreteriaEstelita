import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportarPDFCompras = (reporte, logoBase64, fechaInicio, fechaFin) => {
  if (!reporte || reporte.length === 0) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ========================
  // ENCABEZADO EMPRESA
  // ========================
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 15, 10, 30, 30);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FERRETERÍA LA ESTELITA", pageWidth / 2, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  // doc.text("NIT: 12345678-9", pageWidth / 2, 26, { align: "center" });
  doc.text("Dirección: Caserío Cooperativa, Aldea El Tablón", pageWidth / 2, 31, { align: "center" });
  doc.text("Tel: (502) 5436-3645 | Email: contacto@laestelita.com", pageWidth / 2, 36, { align: "center" });

  // ========================
  // TÍTULO DEL REPORTE
  // ========================
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE DE COMPRAS", pageWidth / 2, 48, { align: "center" });

  // ========================
  // RANGO DE FECHAS
  // ========================
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const rangoTexto = `Desde: ${fechaInicio || "—"}   |   Hasta: ${fechaFin || "—"}`;
  doc.text(rangoTexto, pageWidth / 2, 56, { align: "center" });

  // ========================
  // TABLA DE COMPRAS
  // ========================
  const tableColumn = [
    "#",
    "N°Compra",
    "Fecha",
    "Usuario",
    "Prov.",
    "Cant",
    "Unid.",
    "Subt. Q.",
    "Desc. Q.",
    "Total Q.",
  ];

  const tableRows = reporte.map((compra, index) => {
    // ✅ Cálculo unificado — igual que en el frontend
    const subtotal =
      (parseFloat(compra.total_compra) || 0) +
      (parseFloat(compra.total_descuento) || 0);

    const descuento = parseFloat(compra.total_descuento || 0);
    const total = parseFloat(compra.total_compra || 0);

    return [
      index + 1,
      compra.numerocompra || "SIN COMPROBANTE",
      compra.fecha_compra || "",
      compra.usuario || "",
      compra.proveedor || "",
      compra.cantidad_productos || 0,
      compra.unidades_compradas || 0,
      subtotal.toFixed(2),
      descuento.toFixed(2),
      total.toFixed(2),
    ];
  });

  autoTable(doc, {
    startY: 65,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "right" },
      7: { halign: "right" },
      8: { halign: "right" },
    },
    margin: { left: 10, right: 10 },
  });

  // ========================
  // TOTAL GENERAL
  // ========================
  const finalY = doc.lastAutoTable.finalY || 80;

  const totalGeneral = reporte
    .reduce((sum, compra) => sum + parseFloat(compra.total_compra || 0), 0)
    .toFixed(2);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL GENERAL: Q${totalGeneral}`, pageWidth - 20, finalY + 10, {
    align: "right",
  });

  // ========================
  // PIE DE PÁGINA
  // ========================
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Generado por Sistema de Gestión - Ferretería La Estelita", 15, pageHeight - 10);

  // ========================
  // GUARDAR PDF
  // ========================
  const fechaActual = new Date().toLocaleDateString("es-GT").replace(/\//g, "-");
  doc.save(`Reporte_Compras_${fechaActual}.pdf`);
};
