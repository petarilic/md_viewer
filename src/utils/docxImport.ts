import mammoth from 'mammoth';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

/**
 * Converts a .docx ArrayBuffer into GitHub Flavored Markdown (GFM)
 * while preserving full content, headings, tables, lists, formatting, and images.
 */
export async function convertDocxToMarkdown(
  arrayBuffer: ArrayBuffer
): Promise<{ markdown: string; html: string }> {
  // Convert DOCX to semantic HTML, embedding images as base64 data URLs
  const options = {
    convertImage: mammoth.images.imgElement((image: any) => {
      return image.read('base64').then((imageBuffer: string) => {
        return {
          src: `data:${image.contentType};base64,${imageBuffer}`,
        };
      });
    }),
    styleMap: [
      "p[style-name='Title'] => h1.title:fresh",
      "p[style-name='Subtitle'] => p.subtitle:fresh",
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Heading 4'] => h4:fresh",
      "p[style-name='Heading 5'] => h5:fresh",
      "p[style-name='Heading 6'] => h6:fresh",
      "p[style-name='Quote'] => blockquote:fresh",
      "p[style-name='Intense Quote'] => blockquote:fresh",
      "r[style-name='Emphasis'] => em",
      "r[style-name='Strong'] => strong",
      "r[style-name='Code'] => code",
    ],
  };

  const result = await mammoth.convertToHtml({ arrayBuffer }, options);
  const rawHtml = result.value || '';

  // Initialize Turndown service with GFM plugin
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
  });

  // Enable GFM (tables, strikethrough, task lists)
  turndownService.use(gfm);

  // Preserve underline
  turndownService.addRule('underline', {
    filter: ['u', 'ins'],
    replacement: (content) => `<u>${content}</u>`,
  });

  // Preserve strikethrough
  turndownService.addRule('strikethrough', {
    filter: (node) => {
      const tag = node.nodeName.toLowerCase();
      return tag === 's' || tag === 'del' || tag === 'strike';
    },
    replacement: (content) => `~~${content}~~`,
  });

  // Preserve highlights / marks
  turndownService.addRule('mark', {
    filter: ['mark'],
    replacement: (content) => `<mark>${content}</mark>`,
  });

  // Preserve subscript / superscript
  turndownService.addRule('subscript', {
    filter: ['sub'],
    replacement: (content) => `<sub>${content}</sub>`,
  });
  turndownService.addRule('superscript', {
    filter: ['sup'],
    replacement: (content) => `<sup>${content}</sup>`,
  });

  // Preserve manual line breaks inside paragraphs
  turndownService.addRule('lineBreak', {
    filter: 'br',
    replacement: () => '  \n',
  });

  let markdown = turndownService.turndown(rawHtml);

  // Normalize multiple blank lines to at most 2
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

  // If document was completely empty, provide placeholder title
  if (!markdown) {
    markdown = '# Prazan dokument\n\n*(Uvezeni .docx fajl ne sadrži tekst)*';
  }

  return {
    markdown,
    html: rawHtml,
  };
}

/**
 * Reads and converts a .docx File object into high-fidelity Markdown.
 */
export async function readDocxFile(
  file: File
): Promise<{ markdown: string; html: string }> {
  const arrayBuffer = await file.arrayBuffer();
  return convertDocxToMarkdown(arrayBuffer);
}
