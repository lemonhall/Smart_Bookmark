export type PageSignals = {
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  h1: string;
};

function takeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

export function sanitizePageSignals(raw: unknown): PageSignals {
  const obj = (raw && typeof raw === 'object') ? (raw as Record<string, unknown>) : {};
  return {
    metaDescription: takeText(obj.metaDescription, 600),
    ogTitle: takeText(obj.ogTitle, 300),
    ogDescription: takeText(obj.ogDescription, 800),
    canonicalUrl: takeText(obj.canonicalUrl, 800),
    h1: takeText(obj.h1, 300)
  };
}

export function readPageSignalsFromDom(doc: Document): PageSignals {
  const qMeta = (propOrName: string, kind: 'property' | 'name'): string => {
    const el = doc.querySelector(`meta[${kind}="${propOrName}"]`) as HTMLMetaElement | null;
    return el?.content ?? '';
  };

  const canonical = (doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null)?.href ?? '';
  const h1 = (doc.querySelector('h1') as HTMLElement | null)?.innerText ?? '';

  return sanitizePageSignals({
    metaDescription: qMeta('description', 'name'),
    ogTitle: qMeta('og:title', 'property'),
    ogDescription: qMeta('og:description', 'property'),
    canonicalUrl: canonical,
    h1
  });
}
