import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Bubble Up Trading - Enterprise A4 Print & PDF Engine
 * Handles sandboxed iframes, direct A4 PDF generation, new-tab printer dispatches,
 * and modern CSS color sanitization (OKLCH, Lab, color-mix).
 */

const colorConverterCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const colorConverterCtx = colorConverterCanvas ? colorConverterCanvas.getContext('2d') : null;

export const sanitizeModernColorToRgb = (colorStr: string): string => {
  if (!colorStr) return colorStr;
  if (
    !colorStr.includes('oklch') &&
    !colorStr.includes('oklab') &&
    !colorStr.includes('color(') &&
    !colorStr.includes('lab(') &&
    !colorStr.includes('color-mix')
  ) {
    return colorStr;
  }

  if (colorConverterCtx) {
    try {
      colorConverterCtx.fillStyle = '#000000';
      colorConverterCtx.fillStyle = colorStr;
      const converted = colorConverterCtx.fillStyle;
      if (converted) return converted;
    } catch (e) {
      // Fallback below
    }
  }

  if (colorStr.includes('oklch')) {
    if (colorStr.includes('0.2') || colorStr.includes('0.1')) return '#0f172a';
    if (colorStr.includes('0.9') || colorStr.includes('0.8')) return '#f8fafc';
    return '#334155';
  }
  return colorStr;
};

/**
 * Directly generates and downloads a high-resolution A4 PDF file.
 */
export const exportElementToPdf = async (
  elementId: string,
  filename: string = 'BubbleUp_Document.pdf'
): Promise<boolean> => {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    console.error(`Element with id #${elementId} not found`);
    return false;
  }

  try {
    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: targetElement.scrollWidth,
      windowHeight: targetElement.scrollHeight,
      onclone: (clonedDoc, clonedElement) => {
        try {
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((styleTag) => {
            if (
              styleTag.textContent &&
              (styleTag.textContent.includes('oklch') ||
                styleTag.textContent.includes('color(') ||
                styleTag.textContent.includes('oklab'))
            ) {
              styleTag.textContent = styleTag.textContent.replace(
                /oklch\([^)]+\)/gi,
                (match) => sanitizeModernColorToRgb(match)
              );
            }
          });
        } catch (styleErr) {
          console.warn('Style tag sanitization error:', styleErr);
        }

        try {
          const originalElements = targetElement.querySelectorAll('*');
          const clonedTarget = clonedDoc.getElementById(elementId) || clonedElement;
          const clonedElements = clonedTarget ? clonedTarget.querySelectorAll('*') : [];

          const colorProperties = [
            'color',
            'backgroundColor',
            'borderColor',
            'borderTopColor',
            'borderRightColor',
            'borderBottomColor',
            'borderLeftColor',
            'outlineColor',
            'fill',
            'stroke',
          ] as const;

          for (let i = 0; i < clonedElements.length; i++) {
            const origEl = originalElements[i] as HTMLElement | undefined;
            const cloneEl = clonedElements[i] as HTMLElement | undefined;
            if (!origEl || !cloneEl) continue;

            try {
              const computed = window.getComputedStyle(origEl);
              for (const prop of colorProperties) {
                const val = (computed as any)[prop];
                if (
                  val &&
                  typeof val === 'string' &&
                  (val.includes('oklch') ||
                    val.includes('color(') ||
                    val.includes('oklab') ||
                    val.includes('lab('))
                ) {
                  (cloneEl.style as any)[prop] = sanitizeModernColorToRgb(val);
                }
              }
            } catch (e) {
              // Ignore computed style errors
            }
          }
        } catch (elemErr) {
          console.warn('Element computed color error:', elemErr);
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');

    // A4 Standard Page: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 6;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = contentHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
      heightLeft -= pageHeight;
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.warn('Primary PDF export encountered error, attempting SVG fallback:', error);
    try {
      const fallbackCanvas = await renderElementViaSvgFallback(targetElement, 2);
      const imgData = fallbackCanvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const margin = 6;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = (fallbackCanvas.height * contentWidth) / fallbackCanvas.width;

      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
      const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      pdf.save(cleanFilename);
      return true;
    } catch (svgError) {
      console.error('Canvas export failed, triggering printable fallback:', svgError);
      openInPrintableTab(elementId, filename.replace(/\.pdf$/i, ''));
      return false;
    }
  }
};

/**
 * Secondary SVG ForeignObject rasterization
 */
async function renderElementViaSvgFallback(element: HTMLElement, scale: number = 2): Promise<HTMLCanvasElement> {
  const width = element.scrollWidth || element.offsetWidth || 800;
  const height = element.scrollHeight || element.offsetHeight || 1100;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot create 2d canvas context');

  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const cloned = element.cloneNode(true) as HTMLElement;
  cloned.style.backgroundColor = '#ffffff';
  cloned.style.color = '#0f172a';
  cloned.style.width = `${width}px`;
  cloned.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';

  const serialized = new XMLSerializer().serializeToString(cloned);
  const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="background:#ffffff;color:#0f172a;">
        ${serialized}
      </div>
    </foreignObject>
  </svg>`;

  const img = new Image();
  img.crossOrigin = 'anonymous';

  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = (err) => reject(err);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
  });
}

/**
 * Opens document in a clean new tab via a Blob URL and automatically invokes window.print().
 * This completely bypasses any iframe sandbox restrictions!
 */
export const openInPrintableTab = (
  elementId: string,
  documentTitle: string = 'Bubble Up Document'
) => {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) return;

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join('\n');

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentTitle} - Bubble Up Trading</title>
  ${styles}
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 10mm 10mm;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box;
    }
    body {
      background-color: #f8fafc;
      color: #0f172a;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .print-bar {
      position: sticky;
      top: 10px;
      z-index: 9999;
      background: #0f172a;
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
      font-size: 13px;
      font-weight: bold;
    }
    .print-btn {
      background: #0284c7;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      font-size: 12px;
    }
    .print-btn:hover {
      background: #0369a1;
    }
    .a4-sheet {
      background: white;
      width: 210mm;
      min-height: 297mm;
      padding: 12mm 15mm;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-radius: 4px;
    }
    @media print {
      body {
        background: white !important;
        padding: 0 !important;
      }
      .print-bar {
        display: none !important;
      }
      .a4-sheet {
        box-shadow: none !important;
        border-radius: 0 !important;
        width: 100% !important;
        padding: 0 !important;
      }
      .no-print, button {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span>🖨️ Bubble Up Trading - Official A4 Document Print Station</span>
    <button class="print-btn" onclick="window.print()">Print to A4 Printer (Ctrl+P)</button>
    <button class="print-btn" style="background:#475569;" onclick="window.close()">Close Window</button>
  </div>

  <div class="a4-sheet">
    ${targetElement.innerHTML}
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          window.print();
        } catch(e) {
          console.warn('Auto-print error', e);
        }
      }, 400);
    });
  </script>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Open in new window/tab
  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    // If popup was blocked, fallback to downloading
    downloadAsPrintableHtml(elementId, `${documentTitle.replace(/\s+/g, '_')}.html`);
  }
};

/**
 * Universal print trigger that tries iframe, new tab, and direct print.
 */
export const printDocumentElement = (
  elementId: string,
  documentTitle: string = 'Bubble Up Document'
) => {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    window.print();
    return;
  }

  // Check if we are inside an iframe
  const inIframe = window.self !== window.top;

  if (inIframe) {
    // If in iframe, opening a new tab or generating direct PDF is the only reliable way to print
    openInPrintableTab(elementId, documentTitle);
    return;
  }

  // Normal window direct print
  window.print();
};

/**
 * Downloads a standalone, self-printing HTML document.
 */
export const downloadAsPrintableHtml = (elementId: string, filename: string = 'document.html') => {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) return;

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join('\n');

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  ${styles}
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { background: white; padding: 20px; font-family: sans-serif; }
    @media print { body { padding: 0; } .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div style="max-width:210mm;margin:0 auto;background:#fff;">
    ${targetElement.innerHTML}
  </div>
  <script>
    window.onload = function() { 
      setTimeout(function() { window.print(); }, 300); 
    };
  </script>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
