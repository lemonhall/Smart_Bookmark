import { OpenAIResponsesProvider } from '@openagentic/providers-openai';

export type TestAiConnectionInput = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

export type TestAiConnectionResult =
  | { ok: true; assistantText: string }
  | { ok: false; error: string };

export async function testAiConnection(input: TestAiConnectionInput): Promise<TestAiConnectionResult> {
  const baseUrl = input.baseUrl.trim();
  const apiKey = input.apiKey;
  const model = input.model.trim();

  if (!baseUrl) return { ok: false, error: 'Base URL is required' };
  if (!model) return { ok: false, error: 'Model is required' };
  if (!apiKey) return { ok: false, error: 'API Key is required' };

  try {
    const provider = new OpenAIResponsesProvider({ baseUrl });
    const out = await provider.complete({
      model,
      apiKey,
      store: false,
      instructions: 'Reply with exactly: Hello world.',
      input: [
        {
          role: 'user',
          content: [{ type: 'input_text', text: 'Hello world' }]
        }
      ]
    });

    const text = (out.assistantText ?? '').trim();
    if (!text) return { ok: false, error: 'Empty response' };
    return { ok: true, assistantText: text };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg || 'Unknown error' };
  }
}

