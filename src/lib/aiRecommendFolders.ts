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

export type AiCreateFolderSuggestion = {
  parentFolderId: string;
  title: string;
};

export type AiRecommendations = {
  existingFolderIds: string[];
  create: AiCreateFolderSuggestion | null;
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

function normalizeStringArray(value: unknown, topN: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    .map((x) => x.trim())
    .slice(0, Math.max(0, Math.trunc(topN)));
}

export function parseAiRecommendations(content: string, topN: number): AiRecommendations {
  const trimmed = content.trim();
  const jsonText = trimmed.startsWith('{') ? trimmed : extractFirstJsonObject(trimmed);
  if (!jsonText) return { existingFolderIds: [], create: null };

  try {
    const obj = JSON.parse(jsonText) as any;

    // backward compat: v5 { folderIds: [] }
    const existingFolderIds =
      normalizeStringArray(obj?.existingFolderIds, topN).length > 0
        ? normalizeStringArray(obj?.existingFolderIds, topN)
        : normalizeStringArray(obj?.folderIds, topN);

    const createRaw = obj?.create;
    if (createRaw && typeof createRaw === 'object' && !Array.isArray(createRaw)) {
      const parentFolderId = typeof createRaw.parentFolderId === 'string' ? createRaw.parentFolderId.trim() : '';
      const title = typeof createRaw.title === 'string' ? createRaw.title.trim() : '';
      if (parentFolderId && title) {
        return { existingFolderIds, create: { parentFolderId, title } };
      }
    }

    return { existingFolderIds, create: null };
  } catch {
    return { existingFolderIds: [], create: null };
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
    instructions: [
      'You select bookmark folders for a page.',
      'Return JSON only (no markdown) with shape:',
      '{"existingFolderIds":["..."],"create": {"parentFolderId":"...","title":"..."} | null}.',
      '- existingFolderIds: up to topN ids chosen from folders[].id',
      '- create: optional suggestion to create ONE new folder; parentFolderId must be from folders[].id; title should be short.'
    ].join('\n'),
    input: [
      {
        role: 'user',
        content: [{ type: 'input_text', text: JSON.stringify(promptPayload) }]
      }
    ]
  });

  if (!out.assistantText) return [];
  return parseAiRecommendations(out.assistantText, topN).existingFolderIds;
}

export async function recommendAiSuggestions(
  input: AiRecommendFoldersInput
): Promise<AiRecommendations> {
  const baseUrl = input.baseUrl.trim();
  const apiKey = input.apiKey;
  const model = input.model.trim();
  const topN = Math.max(1, Math.min(10, Math.trunc(input.topN)));

  if (!baseUrl || !model || !apiKey) return { existingFolderIds: [], create: null };

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
    instructions: [
      'You select bookmark folders for a page.',
      'Return JSON only (no markdown) with shape:',
      '{"existingFolderIds":["..."],"create": {"parentFolderId":"...","title":"..."} | null}.',
      '- existingFolderIds: up to topN ids chosen from folders[].id',
      '- create: optional suggestion to create ONE new folder; parentFolderId must be from folders[].id; title should be short.'
    ].join('\n'),
    input: [
      {
        role: 'user',
        content: [{ type: 'input_text', text: JSON.stringify(promptPayload) }]
      }
    ]
  });

  if (!out.assistantText) return { existingFolderIds: [], create: null };
  return parseAiRecommendations(out.assistantText, topN);
}
