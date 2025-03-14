import { SkaterStats } from "../api/client";

// Convert skater stats to CSV format
export function convertSkaterStatsToCSV(stats: SkaterStats): string {
  // Extract history entries
  const history = stats.history;

  if (history.length === 0) {
    return "";
  }

  // Get headers from first entry
  const headers = Object.keys(history[0]).filter(
    (key) =>
      // Filter out complex objects that wouldn't make sense in CSV
      typeof history[0][key as keyof (typeof history)[0]] !== "object"
  );

  // Create CSV header row
  const csvRows = [headers.join(",")];

  // Add data rows
  for (const entry of history) {
    const row = headers.map((header) => {
      const value = entry[header as keyof typeof entry];
      // Handle special cases and escaping
      if (value === null || value === undefined) {
        return "";
      }
      if (typeof value === "string" && value.includes(",")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    });
    csvRows.push(row.join(","));
  }

  return csvRows.join("\n");
}

// Download data as JSON file
export function downloadAsJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, filename);
}

// Download data as CSV file
export function downloadAsCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

// Helper function to trigger download
function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
