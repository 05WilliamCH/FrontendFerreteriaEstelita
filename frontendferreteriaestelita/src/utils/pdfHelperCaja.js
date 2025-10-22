// utils/pdfHelperCaja.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportarPDFCajas = (cajas, logoBase64 = null, fechaInicio = null, fechaFin = null) => {
  if (!cajas || cajas.length === 0) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ========================
  // ENCABEZADO
  // ========================
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 15, 10, 30, 30);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FERRETERÍA LA ESTELITA", pageWidth / 2, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Reporte de Cajas", pageWidth / 2, 28, { align: "center" });
  doc.text(`Desde: ${fechaInicio || "—"} | Hasta: ${fechaFin || "—"}`, pageWidth / 2, 34, { align: "center" });

  // ========================
  // TABLA DE CAJAS
  // ========================
  const tableColumn = [
    "#", "Usuario Apertura", "Fecha Apertura", "Fecha Cierre",
    "Monto Inicial", "Total Ventas", "Monto Final", "Estado", "Observaciones"
  ];

  const tableRows = cajas.map((caja, index) => {
    const montoInicial = Number(caja.monto_inicial) || 0;
    const totalVentas = Number(caja.total_ventas) || 0;
    const montoFinal = caja.monto_final !== null && caja.monto_final !== undefined ? Number(caja.monto_final) : 0;

    return [
      index + 1,
      caja.usuario_apertura || "—",
      caja.fecha_apertura ? new Date(caja.fecha_apertura).toLocaleString("es-GT") : "—",
      caja.fecha_cierre ? new Date(caja.fecha_cierre).toLocaleString("es-GT") : "—",
      montoInicial.toFixed(2),
      totalVentas.toFixed(2),
      montoFinal.toFixed(2),
      caja.estado ? "Abierta" : "Cerrada",
      caja.observaciones || "—",
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: { fillColor: [39, 174, 96], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9 },
    columnStyles: {
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
    },
    margin: { left: 10, right: 10 },
  });

  // ========================
  // TOTAL GENERAL
  // ========================
  const finalY = doc.lastAutoTable.finalY || 40;
  const totalGeneral = cajas
    .reduce((sum, c) => sum + (c.monto_final !== null && c.monto_final !== undefined ? Number(c.monto_final) : 0), 0)
    .toFixed(2);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL GENERAL: Q${totalGeneral}`, pageWidth - 15, finalY + 10, { align: "right" });

  // ========================
  // PIE DE PÁGINA
  // ========================
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Generado por Sistema de Gestión - Ferretería La Estelita", 15, pageHeight - 10);

  // ========================
  // GUARDAR PDF
  // ========================
  doc.save(`Reporte_Cajas_${new Date().toLocaleDateString().replace(/\//g, "-")}.pdf`);
};
