import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportarPDFCompras = (reporte, logoBase64) => {
  if (!reporte || reporte.length === 0) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ------------------------
  // LOGO
  // ------------------------
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 15, 10, 30, 30);
  }

  // ------------------------
  // TÍTULO
  // ------------------------
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE DE COMPRAS", pageWidth / 2, 20, { align: "center" });

  // ------------------------
  // FILTRO FECHAS (opcional)
  // ------------------------
  // Puedes pasar fechaInicio y fechaFin como argumento si quieres mostrarlas
  // doc.setFontSize(10);
  // doc.setFont("helvetica", "normal");
  // doc.text(`Desde: ${fechaInicio || "-"}`, 15, 35);
  // doc.text(`Hasta: ${fechaFin || "-"}`, 100, 35);

  // ------------------------
  // TABLA DE COMPRAS
  // ------------------------
  const tableColumn = [
    "#",
    "Fecha",
    "Usuario",
    "Proveedor",
    "Cantidad Productos",
    "Unidades Compradas",
    "Total Q.",
  ];

  const tableRows = reporte.map((compra, index) => [
    index + 1,
    compra.fecha_compra,
    compra.usuario,
    compra.proveedor || "",
    compra.cantidad_productos,
    compra.unidades_compradas,
    Number(compra.total_compra).toFixed(2),
  ]);

  autoTable(doc, {
    startY: 45,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10 },
    margin: { left: 10, right: 10 },
    columnStyles: {
      4: { halign: "center" }, // Cantidad Productos centrado
      5: { halign: "center" }, // Unidades compradas centrado
      6: { halign: "right" },  // Total a la derecha
    },
  });

  // ------------------------
  // TOTAL GENERAL
  // ------------------------
  const finalY = doc.lastAutoTable.finalY || 60;
  const totalGeneral = reporte
    .reduce((sum, compra) => sum + parseFloat(compra.total_compra || 0), 0)
    .toFixed(2);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL GENERAL: Q${totalGeneral}`, pageWidth - 20, finalY + 10, { align: "right" });

  // ------------------------
  // PIE DE PÁGINA
  // ------------------------
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Generado por Sistema de Gestión de Ferretería", 15, pageHeight - 10);

  // ------------------------
  // GUARDAR PDF
  // ------------------------
  doc.save(`Reporte_Compras_${new Date().toLocaleDateString()}.pdf`);
};
