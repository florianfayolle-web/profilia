"use client";

// Exporting to PDF reuses the browser's own print pipeline (window.print +
// "Save as PDF" in the print dialog) instead of a server-side PDF renderer:
// zero extra dependency, and it reuses the exact same charts/layout that
// are already tested on screen. Print-specific CSS (globals.css) hides
// navigation and this button itself so only the report shows up.
export function DownloadPdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden rounded-full border border-card-border px-6 py-2.5 text-sm font-medium transition hover:border-primary/40"
    >
      Télécharger en PDF
    </button>
  );
}
