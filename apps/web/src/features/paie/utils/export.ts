import type { PaiePreviewRow, PeriodePaie } from "@/features/paie/types";

type ExportRow = {
  lastName: string;
  firstName: string;
  totalHeuresTravaillees: number;
  heuresMajorees: number;
  nombreIndemnites: number;
  chantiers: string;
};

function buildExportRows(rows: PaiePreviewRow[]): ExportRow[] {
  return rows.map((row) => ({
    lastName: row.lastName.toUpperCase(),
    firstName: row.firstName,
    totalHeuresTravaillees: row.totalHeuresTravaillees,
    heuresMajorees: row.heuresMajoreesRetenues,
    nombreIndemnites: row.nombreIndemnitesRetenues,
    chantiers: row.chantiers.join(" | "),
  }));
}

function triggerDownload(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

// CA1 + CA3 : CSV UTF-8 BOM, séparateur point-virgule (standard FR)
export function exportCsv(rows: PaiePreviewRow[], periode: PeriodePaie): void {
  const exportRows = buildExportRows(rows);

  const headers = [
    "Nom",
    "Prénom",
    "Heures travaillées",
    "Heures majorées",
    "Indemnités",
    "Chantiers",
  ].join(";");

  const lines = exportRows.map((r) =>
    [
      r.lastName,
      r.firstName,
      r.totalHeuresTravaillees.toFixed(2).replace(".", ","),
      r.heuresMajorees.toFixed(2).replace(".", ","),
      r.nombreIndemnites,
      r.chantiers,
    ].join(";"),
  );

  // BOM UTF-8 pour compatibilité Excel
  const csv = "\uFEFF" + [headers, ...lines].join("\r\n");
  const filename = `paie_${periode.dateFrom}_${periode.dateTo}.csv`;
  triggerDownload(csv, filename, "text/csv;charset=utf-8");
}

// CA2 : Excel via SpreadsheetML (XML Office 2003 — aucune dépendance requise)
export function exportExcel(
  rows: PaiePreviewRow[],
  periode: PeriodePaie,
): void {
  const exportRows = buildExportRows(rows);

  const headerRow = [
    "Nom",
    "Prénom",
    "Heures travaillées",
    "Heures majorées",
    "Indemnités",
    "Chantiers",
  ]
    .map((h) => `<Cell><Data ss:Type="String">${h}</Data></Cell>`)
    .join("");

  const dataRows = exportRows
    .map((r) => {
      const cells = [
        `<Cell><Data ss:Type="String">${escapeXml(r.lastName)}</Data></Cell>`,
        `<Cell><Data ss:Type="String">${escapeXml(r.firstName)}</Data></Cell>`,
        `<Cell><Data ss:Type="Number">${r.totalHeuresTravaillees.toFixed(2)}</Data></Cell>`,
        `<Cell><Data ss:Type="Number">${r.heuresMajorees.toFixed(2)}</Data></Cell>`,
        `<Cell><Data ss:Type="Number">${r.nombreIndemnites}</Data></Cell>`,
        `<Cell><Data ss:Type="String">${escapeXml(r.chantiers)}</Data></Cell>`,
      ].join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#D9E1F2" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Paie">
    <Table>
      <Row ss:StyleID="header">${headerRow}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;

  const filename = `paie_${periode.dateFrom}_${periode.dateTo}.xls`;
  triggerDownload(xml, filename, "application/vnd.ms-excel;charset=utf-8");
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
