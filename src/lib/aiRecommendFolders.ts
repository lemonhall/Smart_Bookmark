import { OpenAIResponsesProvider } from '@openagentic/providers-openai';

export type AiFolderCandidate = {
  id: string;
  path: string;
};

export type AiRecommendFoldersInput = {
  baseUrl: string;
  apiKey: string;
  model: string;
  topN: number;
  pageUrl: string;
  pageTitle: string;
  folders: AiFolderCandidate[];
};

function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start < 0) return null;

  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

export function parseAiFolderIds(content: string, topN: number): string[] {
  const trimmed = content.trim();
  const jsonText = trimmed.startsWith('{') ? trimmed : extractFirstJsonObject(trimmed);
  if (!jsonText) return [];

  try {
    const obj = JSON.parse(jsonText) as { folderIds?: unknown };
    if (!Array.isArray(obj.folderIds)) return [];
    return obj.folderIds
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map((x) => x.trim())
      .slice(0, Math.max(0, Math.trunc(topN)));
  } catch {
    return [];
  }
}

export async function recommendAiFolderIds(input: AiRecommendFoldersInput): Promise<string[]> {
  const baseUrl = input.baseUrl.trim();
  const apiKey = input.apiKey;
  const model = input.model.trim();
  const topN = Math.max(1, Math.min(10, Math.trunc(input.topN)));

  if (!baseUrl || !model || !apiKey) return [];

  const provider = new OpenAIResponsesProvider({ baseUrl });

  const promptPayload = {
    topN,
    page: { url: input.pageUrl, title: input.pageTitle },
    folders: input.folders
  };

  const out = await provider.complete({
    model,
    apiKey,
    store: false,
    instructions:
      'You select bookmark folders for a page. Return JSON only with shape {"folderIds":["..."]}.',
    input: [
      {
        role: 'user',
        content: [{ type: 'input_text', text: JSON.stringify(promptPayload) }]
      }
    ]
  });

  if (!out.assistantText) return [];
  return parseAiFolderIds(out.assistantText, topN);
}
