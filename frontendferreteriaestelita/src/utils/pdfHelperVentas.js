import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportarPDFVentas = (reporte, logoBase64, fechaInicio, fechaFin) => {
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
  doc.text("NIT: 12345678-9", pageWidth / 2, 26, { align: "center" });
  doc.text("Dirección: Caserío Cooperativa, Aldea El Tablón", pageWidth / 2, 31, { align: "center" });
  doc.text("Tel: (502) 1234-5678 | Email: contacto@laestelita.com", pageWidth / 2, 36, { align: "center" });

  // ========================
  // TÍTULO DEL REPORTE
  // ========================
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE DE VENTAS", pageWidth / 2, 48, { align: "center" });

  // ========================
  // RANGO DE FECHAS
  // ========================
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const rangoTexto = `Desde: ${fechaInicio || "—"}   |   Hasta: ${fechaFin || "—"}`;
  doc.text(rangoTexto, pageWidth / 2, 56, { align: "center" });

  // ========================
  // TABLA DE VENTAS
  // ========================
  const tableColumn = [
    "#",
    "Fecha",
    "Cliente",
    "Usuario (Vendedor)",
    "Cant. Productos",
    "Unidades Vendidas",
    "Total Q.",
  ];

  const tableRows = reporte.map((venta, index) => [
    index + 1,
    venta.fecha_venta,
    venta.cliente || "",
    venta.usuario || "",
    venta.cantidad_productos,
    venta.unidades_vendidas,
    Number(venta.total_venta).toFixed(2),
  ]);

  autoTable(doc, {
    startY: 65,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: { fillColor: [39, 174, 96], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10 },
    margin: { left: 10, right: 10 },
    columnStyles: {
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "right" },
    },
  });

  // ========================
  // TOTAL GENERAL
  // ========================
  const finalY = doc.lastAutoTable.finalY || 80;
  const totalGeneral = reporte
    .reduce((sum, venta) => sum + parseFloat(venta.total_venta || 0), 0)
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
  doc.save(`Reporte_Ventas_${new Date().toLocaleDateString().replace(/\//g, "-")}.pdf`);
};
