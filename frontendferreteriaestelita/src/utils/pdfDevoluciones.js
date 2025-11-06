import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generarPDFDevoluciones = (data, filtros, logoBase64 = null) => {
  const doc = new jsPDF("l", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // -----------------------------
  // ENCABEZADO
  // -----------------------------
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 40, 25, 70, 70);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Ferretería El Manantial", pageWidth / 2, 55, { align: "center" });

  doc.setFontSize(14);
  doc.text("Reporte de Devoluciones", pageWidth / 2, 80, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Desde: ${filtros.fechaInicio}   Hasta: ${filtros.fechaFin}`,
    pageWidth / 2,
    100,
    { align: "center" }
  );

  // Línea separadora
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(1.2);
  doc.line(40, 110, pageWidth - 40, 110);

  // -----------------------------
  // TABLA DE DATOS
  // -----------------------------
  const body = data.map((r, i) => [
    i + 1,
    r.tipo,
    r.numero,
    new Date(r.fecha).toLocaleString(),
    r.usuario,
    r.proveedor_cliente,
    r.motivo,
    Number(r.total).toFixed(2),
  ]);

  autoTable(doc, {
    startY: 130,
    head: [
      [
        "#",
        "Tipo",
        "Número",
        "Fecha",
        "Usuario",
        "Cliente / Proveedor",
        "Motivo",
        "Total (Q)",
      ],
    ],
    body,
    theme: "striped",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 5,
    },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    columnStyles: {
      0: { halign: "center", cellWidth: 30 },
      1: { halign: "center", cellWidth: 70 },
      2: { halign: "center", cellWidth: 90 },
      3: { halign: "center", cellWidth: 110 },
      4: { halign: "left", cellWidth: 100 },
      5: { halign: "left", cellWidth: 110 },
      6: { halign: "left", cellWidth: 140 },
      7: { halign: "right", cellWidth: 70 },
    },
  });

  // -----------------------------
  // TOTAL GENERAL
  // -----------------------------
  const totalGeneral = data.reduce((sum, r) => sum + Number(r.total), 0);
  const finalY = doc.lastAutoTable.finalY + 30;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Total general de devoluciones: Q. ${totalGeneral.toFixed(2)}`, 40, finalY);

  // Pie de página
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(
    `Generado el ${new Date().toLocaleString()}`,
    pageWidth - 200,
    pageHeight - 30
  );

  // Guardar
  doc.save(`Reporte_Devoluciones_${filtros.fechaInicio}_a_${filtros.fechaFin}.pdf`);
};
