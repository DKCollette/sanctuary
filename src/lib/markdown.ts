import { marked } from "marked";

// Client-side DOMPurify import
let DOMPurify: any = null;
let jsdom: any = null;

async function getDOMPurify() {
  if (typeof window !== "undefined") {
    // Client-side
    const dompurify = await import("dompurify");
    return dompurify.default;
  } else {
    // Server-side
    if (!DOMPurify) {
      jsdom = await import("jsdom");
      const { JSDOM } = jsdom;
      const window = new JSDOM("").window;
      DOMPurify = (await import("dompurify")).default(window as any);
    }
    return DOMPurify;
  }
}

export async function sanitizeHtml(html: string): Promise<string> {
  const purify = await getDOMPurify();
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "em", "strong", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre",
      "hr", "div", "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });
}

export async function renderMarkdown(md: string): Promise<string> {
  const rawHtml = await marked.parse(md, { async: true });
  return sanitizeHtml(rawHtml);
}