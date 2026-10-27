import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { renderMarkdownToHtml } from './markdown';
import { ViewerSettings, FontSize } from '../types';

export interface PdfExportOptions {
  filename: string;
  pageSize?: 'a4' | 'letter';
  orientation?: 'p' | 'l';
  theme?: 'light' | 'dark';
  includeHeader?: boolean;
  settings?: ViewerSettings;
}

/**
 * Generates a high-quality PDF Blob from markdown content preserving formatting,
 * unicode characters (including Serbian Latin č, ć, ž, š, đ and Cyrillic), tables,
 * syntax-highlighted code blocks, and images.
 */
export async function generatePdfBlob(
  markdown: string,
  docTitle: string,
  options: PdfExportOptions
): Promise<Blob> {
  const isDark = options.theme === 'dark';
  const isLandscape = options.orientation === 'l';
  const pageSize = options.pageSize || 'a4';

  // Dimensions in mm
  // A4: 210 x 297 mm, Letter: 215.9 x 279.4 mm
  let pdfWidth = pageSize === 'letter' ? 215.9 : 210;
  let pdfHeight = pageSize === 'letter' ? 279.4 : 297;
  if (isLandscape) {
    const tmp = pdfWidth;
    pdfWidth = pdfHeight;
    pdfHeight = tmp;
  }

  // Render markdown to safe HTML using the app's renderer
  const rawHtml = renderMarkdownToHtml(markdown, true);

  // Create staging container placed in document flow (top: 0, left: 0 with z-index: -99999)
  // so html2canvas captures its actual coordinate geometry without clipping.
  const stage = document.createElement('div');
  stage.id = 'pdf-export-stage';
  stage.className = isDark ? 'dark' : '';
  stage.style.position = 'fixed';
  stage.style.top = '0';
  stage.style.left = '0';
  stage.style.width = isLandscape ? '1120px' : '820px';
  stage.style.minHeight = '100px';
  stage.style.margin = '0';
  stage.style.padding = '0';
  stage.style.zIndex = '-99999';
  stage.style.pointerEvents = 'none';
  stage.style.backgroundColor = isDark ? '#090d16' : '#ffffff';
  stage.style.color = isDark ? '#f8fafc' : '#0f172a';

  // Document header if selected
  let headerHtml = '';
  if (options.includeHeader) {
    const dateStr = new Date().toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    headerHtml = `
      <div style="border-bottom: 2px solid ${isDark ? '#334155' : '#e2e8f0'}; padding-bottom: 12px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: baseline; font-size: 11px; color: ${isDark ? '#94a3b8' : '#64748b'};">
        <span style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(docTitle)}</span>
        <span>${dateStr}</span>
      </div>
    `;
  }

  // 1. Resolve Font Family for PDF
  const fontFamilyCss =
    options.settings?.fontFamily === 'serif'
      ? 'Georgia, Cambria, "Times New Roman", Times, serif'
      : options.settings?.fontFamily === 'mono'
      ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
      : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  // 2. Resolve Font Sizes based on user settings
  const fontSizeMap: Record<
    string,
    { body: string; h1: string; h2: string; h3: string; h4: string; code: string; table: string }
  > = {
    sm: { body: '13px', h1: '23px', h2: '19px', h3: '16px', h4: '14px', code: '11px', table: '11.5px' },
    base: { body: '15px', h1: '27px', h2: '22px', h3: '18px', h4: '15.5px', code: '12.5px', table: '13px' },
    lg: { body: '17.5px', h1: '31px', h2: '25px', h3: '21px', h4: '18px', code: '14px', table: '14.5px' },
    xl: { body: '20px', h1: '35px', h2: '29px', h3: '24px', h4: '20.5px', code: '15.5px', table: '16px' },
  };
  const fontSizes = fontSizeMap[options.settings?.fontSize || 'base'] || fontSizeMap.base;

  // 3. Resolve Margins / Width based on contentWidth setting
  // 'narrow': narrow content with generous wide margins
  // 'standard': standard comfortable margins
  // 'wide': wider content with narrower margins
  // 'full': minimal margins
  let paddingCss = isLandscape ? '40px 56px' : '40px 48px';
  let maxWidthCss = isLandscape ? '960px' : '820px';

  switch (options.settings?.contentWidth) {
    case 'narrow':
      paddingCss = isLandscape ? '44px 88px' : '44px 76px';
      maxWidthCss = isLandscape ? '800px' : '680px';
      break;
    case 'standard':
      paddingCss = isLandscape ? '40px 56px' : '40px 48px';
      maxWidthCss = isLandscape ? '960px' : '820px';
      break;
    case 'wide':
      paddingCss = isLandscape ? '36px 36px' : '36px 28px';
      maxWidthCss = isLandscape ? '1060px' : '890px';
      break;
    case 'full':
      paddingCss = isLandscape ? '28px 24px' : '28px 18px';
      maxWidthCss = '100%';
      break;
  }

  // 4. Resolve Line Spacing
  const lineSpacingCss =
    options.settings?.lineSpacing === 'compact'
      ? '1.38'
      : options.settings?.lineSpacing === 'relaxed'
      ? '1.8'
      : '1.58';

  // Embed exact styling so markdown-body, highlight.js, tables, and code blocks
  // faithfully reflect the user's typography, size, margins, and theme.
  stage.innerHTML = `
    <style>
      #pdf-export-stage * {
        box-sizing: border-box;
      }
      .pdf-content-wrapper {
        padding: ${paddingCss};
        max-width: ${maxWidthCss};
        width: 100%;
        margin: 0 auto;
        font-family: ${fontFamilyCss};
        font-size: ${fontSizes.body};
        line-height: ${lineSpacingCss};
      }
      .markdown-body {
        font-family: ${fontFamilyCss} !important;
        font-size: ${fontSizes.body} !important;
        line-height: ${lineSpacingCss} !important;
      }
      .markdown-body h1 {
        font-size: ${fontSizes.h1} !important;
        line-height: 1.25 !important;
        margin-top: 1.5rem !important;
        margin-bottom: 0.75rem !important;
      }
      .markdown-body h2 {
        font-size: ${fontSizes.h2} !important;
        line-height: 1.3 !important;
        margin-top: 1.3rem !important;
        margin-bottom: 0.65rem !important;
      }
      .markdown-body h3 {
        font-size: ${fontSizes.h3} !important;
        line-height: 1.35 !important;
        margin-top: 1.1rem !important;
        margin-bottom: 0.5rem !important;
      }
      .markdown-body h4 {
        font-size: ${fontSizes.h4} !important;
      }
      .markdown-body p, .markdown-body li {
        font-size: ${fontSizes.body} !important;
        line-height: ${lineSpacingCss} !important;
      }
      .copy-code-btn, .heading-anchor {
        display: none !important;
      }
      .table-container {
        width: 100% !important;
        overflow: visible !important;
        margin: 1.5rem 0 !important;
        border-radius: 8px !important;
        border: 1px solid ${isDark ? '#334155' : '#cbd5e1'} !important;
      }
      .table-container table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: ${fontSizes.table} !important;
      }
      .code-block-wrapper {
        margin: 1.25rem 0 !important;
        border-radius: 8px !important;
        overflow: hidden !important;
        border: 1px solid ${isDark ? '#334155' : '#1e293b'} !important;
      }
      .code-block-wrapper pre {
        white-space: pre-wrap !important;
        word-break: break-all !important;
        font-size: ${fontSizes.code} !important;
      }
    </style>
    <div class="pdf-content-wrapper ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}">
      ${headerHtml}
      <div class="markdown-body ${isDark ? 'dark text-slate-100' : 'text-slate-900'}">
        ${rawHtml}
      </div>
    </div>
  `;

  document.body.appendChild(stage);

  try {
    // 1. Ensure fonts are fully loaded
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 2. Wait for any images to complete loading
    const images = Array.from(stage.querySelectorAll('img'));
    if (images.length > 0) {
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) {
                resolve();
              } else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
                setTimeout(resolve, 2000);
              }
            })
        )
      );
    }

    // Microtick to ensure layout paint
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 3. Render stage with html2canvas-pro
    const canvas = await html2canvas(stage, {
      scale: 2, // High-DPI crisp quality
      useCORS: true,
      logging: false,
      backgroundColor: isDark ? '#090d16' : '#ffffff',
      onclone: (_clonedDoc, clonedElement) => {
        // In cloned iframe, position statically at top-left
        clonedElement.style.position = 'static';
        clonedElement.style.zIndex = '1';
        clonedElement.style.visibility = 'visible';
        clonedElement.style.opacity = '1';

        // Clean interactive elements not needed in print
        clonedElement.querySelectorAll('.copy-code-btn, .heading-anchor').forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
      },
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Neuspešno iscrtavanje dokumenta za PDF.');
    }

    // 4. Initialize jsPDF
    const pdf = new jsPDF({
      orientation: options.orientation || 'p',
      unit: 'mm',
      format: pageSize,
    });

    // 5. Paginate slices onto PDF pages
    const pageCanvasHeight = Math.floor((canvas.width * pdfHeight) / pdfWidth);
    let renderedHeight = 0;
    let pageIndex = 0;

    while (renderedHeight < canvas.height) {
      const currentSliceHeight = Math.min(pageCanvasHeight, canvas.height - renderedHeight);
      if (currentSliceHeight <= 0) break;

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageCanvasHeight;
      const ctx = pageCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvasHeight);
        ctx.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          currentSliceHeight,
          0,
          0,
          canvas.width,
          currentSliceHeight
        );

        if (pageIndex > 0) {
          pdf.addPage();
        }

        const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      renderedHeight += currentSliceHeight;
      pageIndex++;
    }

    return pdf.output('blob');
  } finally {
    if (stage.parentNode) {
      stage.parentNode.removeChild(stage);
    }
  }
}

/**
 * Saves a PDF Blob to disk by triggering the native "Save As" file picker
 * when supported, or safely falling back to browser download.
 */
export async function savePdfFile(
  pdfBlob: Blob,
  filename: string
): Promise<{ success: boolean; method: 'picker' | 'download'; cancelled?: boolean }> {
  let cleanName = filename.trim();
  if (!cleanName) cleanName = 'Dokument.pdf';
  if (!cleanName.toLowerCase().endsWith('.pdf')) {
    cleanName += '.pdf';
  }

  // 1. Try native File System Access API (showSaveFilePicker)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: cleanName,
        types: [
          {
            description: 'PDF Dokument (*.pdf)',
            accept: {
              'application/pdf': ['.pdf'],
            },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(pdfBlob);
      await writable.close();

      return { success: true, method: 'picker' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User clicked Cancel in native OS dialog
        return { success: false, method: 'picker', cancelled: true };
      }
      console.warn('showSaveFilePicker failed or restricted in iframe, falling back to download:', err);
    }
  }

  // 2. Fallback: Browser download
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cleanName;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);

  return { success: true, method: 'download' };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
