declare module 'mammoth' {
  export interface MammothResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export interface ConvertOptions {
    arrayBuffer?: ArrayBuffer;
    buffer?: any;
    path?: string;
    styleMap?: string | string[];
    includeDefaultStyleMap?: boolean;
    convertImage?: any;
    ignoreEmptyParagraphs?: boolean;
  }

  export function convertToHtml(input: { arrayBuffer: ArrayBuffer }, options?: ConvertOptions): Promise<MammothResult>;
  export function convertToMarkdown(input: { arrayBuffer: ArrayBuffer }, options?: ConvertOptions): Promise<MammothResult>;
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>;

  export namespace images {
    export function imgElement(func: (image: any) => Promise<{ src: string } | Record<string, string>>): any;
  }

  const mammoth: {
    convertToHtml: typeof convertToHtml;
    convertToMarkdown: typeof convertToMarkdown;
    extractRawText: typeof extractRawText;
    images: typeof images;
  };

  export default mammoth;
}

declare module 'turndown-plugin-gfm' {
  import TurndownService from 'turndown';
  export const gfm: (service: TurndownService) => void;
  export const tables: (service: TurndownService) => void;
  export const strikethrough: (service: TurndownService) => void;
  export const taskListItems: (service: TurndownService) => void;
}
