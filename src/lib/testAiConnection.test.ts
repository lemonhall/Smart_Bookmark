import { describe, expect, it, vi } from 'vitest';
import { testAiConnection } from './testAiConnection';

describe('testAiConnection', () => {
  it('returns error when required fields missing', async () => {
    expect(await testAiConnection({ baseUrl: '', apiKey: 'k', model: 'm' })).toEqual({
      ok: false,
      error: 'Base URL is required'
    });
    expect(await testAiConnection({ baseUrl: 'https://x', apiKey: '', model: 'm' })).toEqual({
      ok: false,
      error: 'API Key is required'
    });
    expect(await testAiConnection({ baseUrl: 'https://x', apiKey: 'k', model: '' })).toEqual({
      ok: false,
      error: 'Model is required'
    });
  });

  it('calls responses endpoint and returns assistant text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: 'Hello world.' }]
          }
        ]
      })
    });
    // @ts-expect-error test stub
    globalThis.fetch = fetchMock;

    const res = await testAiConnection({
      baseUrl: 'https://www.right.codes/v1',
      apiKey: 'sk-test',
      model: 'gpt-5.2'
    });

    expect(res.ok).toBe(true);
    if (res.ok) expect(res.assistantText).toContain('Hello');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as any[];
    expect(url).toBe('https://www.right.codes/v1/responses');
    expect(init?.headers?.authorization ?? init?.headers?.Authorization).toContain('Bearer ');
    expect(init?.credentials).toBe('omit');
  });

  it('supports SSE gateways that return event-stream for non-stream requests', async () => {
    async function* sseBody() {
      yield 'event: response.output_text.delta\n';
      yield 'data: {"type":"response.output_text.delta","delta":"Hello world."}\n';
      yield '\n';
      yield 'data: [DONE]\n';
      yield '\n';
    }

    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: { get: () => 'text/event-stream' },
      body: sseBody()
    });
    // @ts-expect-error test stub
    globalThis.fetch = fetchMock;

    const res = await testAiConnection({
      baseUrl: 'https://www.right.codes/v1',
      apiKey: 'sk-test',
      model: 'gpt-5.2'
    });

    expect(res).toEqual({ ok: true, assistantText: 'Hello world.' });
  });
});
