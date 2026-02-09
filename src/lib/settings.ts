export type SmartBookmarkAiSettings = {
  enabled: boolean;
  endpointUrl: string;
  model: string;
  apiKey: string;
};

export type SmartBookmarkSettings = {
  topN: number;
  closeOnSave: boolean;
  ai: SmartBookmarkAiSettings;
};

const SETTINGS_KEY = 'sbSettings';

export const DEFAULT_SETTINGS: SmartBookmarkSettings = {
  topN: 3,
  closeOnSave: true,
  ai: {
    enabled: false,
    endpointUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    apiKey: ''
  }
};

function promisify<T>(fn: (cb: (result: T) => void) => void): Promise<T> {
  return new Promise((resolve) => fn(resolve));
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const v = Math.trunc(value);
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

function coerceString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function coerceBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function sanitizeSettings(raw: unknown): SmartBookmarkSettings {
  const obj = (raw && typeof raw === 'object') ? (raw as Record<string, unknown>) : {};
  const aiRaw = (obj.ai && typeof obj.ai === 'object') ? (obj.ai as Record<string, unknown>) : {};

  return {
    topN: clampInt(obj.topN, DEFAULT_SETTINGS.topN, 1, 10),
    closeOnSave: coerceBool(obj.closeOnSave, DEFAULT_SETTINGS.closeOnSave),
    ai: {
      enabled: coerceBool(aiRaw.enabled, DEFAULT_SETTINGS.ai.enabled),
      endpointUrl: coerceString(aiRaw.endpointUrl, DEFAULT_SETTINGS.ai.endpointUrl).trim(),
      model: coerceString(aiRaw.model, DEFAULT_SETTINGS.ai.model).trim(),
      apiKey: coerceString(aiRaw.apiKey, DEFAULT_SETTINGS.ai.apiKey)
    }
  };
}

export async function loadSettings(): Promise<SmartBookmarkSettings> {
  const result = await promisify<Record<string, unknown>>((cb) => chrome.storage.local.get(SETTINGS_KEY, cb));
  return sanitizeSettings(result[SETTINGS_KEY]);
}

export async function saveSettings(settings: SmartBookmarkSettings): Promise<void> {
  await promisify((cb) => chrome.storage.local.set({ [SETTINGS_KEY]: sanitizeSettings(settings) }, cb));
}

export async function updateSettings(partial: Partial<SmartBookmarkSettings>): Promise<SmartBookmarkSettings> {
  const current = await loadSettings();
  const next: SmartBookmarkSettings = {
    ...current,
    ...partial,
    ai: {
      ...current.ai,
      ...(partial.ai ?? {})
    }
  };
  await saveSettings(next);
  return next;
}

