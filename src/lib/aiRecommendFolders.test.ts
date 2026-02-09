import { describe, expect, it, vi } from 'vitest';
import { parseAiRecommendations, recommendAiSuggestions } from './aiRecommendFolders';

describe('parseAiRecommendations', () => {
  it('parses plain JSON', () => {
    expect(parseAiRecommendations('{"existingFolderIds":["a","b"],"create":null}', 3)).toEqual({
      existingFolderIds: ['a', 'b'],
      create: null
    });
  });

  it('extracts JSON from mixed text', () => {
    const text = 'Sure! {"existingFolderIds":["x"],"create":null}\n';
    expect(parseAiRecommendations(text, 3)).toEqual({ existingFolderIds: ['x'], create: null });
  });

  it('supports backward compat folderIds', () => {
    expect(parseAiRecommendations('{"folderIds":["a","b"]}', 3)).toEqual({
      existingFolderIds: ['a', 'b'],
      create: null
    });
  });

  it('parses create suggestion', () => {
    expect(
      parseAiRecommendations('{"existingFolderIds":["10"],"create":{"parentFolderId":"1","title":"Vue"}}', 3)
    ).toEqual({
      existingFolderIds: ['10'],
      create: { parentFolderId: '1', title: 'Vue' }
    });
  });

  it('returns empty for invalid payloads', () => {
    expect(parseAiRecommendations('not json', 3)).toEqual({ existingFolderIds: [], create: null });
    expect(parseAiRecommendations('{"existingFolderIds":"nope"}', 3)).toEqual({
      existingFolderIds: [],
      create: null
    });
  });
});

describe('recommendAiSuggestions', () => {
  it('posts minimal payload and parses recommendations', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({
        output: [
          {
            type: 'message',
            content: [
              {
                type: 'output_text',
                text: '{"existingFolderIds":["10"],"create":{"parentFolderId":"11","title":"Vue"}}'
              }
            ]
          }
        ]
      })
    });
    // @ts-expect-error test stub
    globalThis.fetch = fetchMock;

    const leak = 'https://secret.example.com/private';
    const result = await recommendAiSuggestions({
      baseUrl: 'https://api.openai.com/v1',
      apiKey: 'sk-test',
      model: 'gpt-5.2',
      topN: 3,
      pageUrl: 'https://unknown.example.com/docs/vue',
      pageTitle: 'Vue',
      folders: [
        { id: '10', path: '书签栏 / 前端' },
        { id: '11', path: '书签栏 / Linux' }
      ]
    });

    expect(result).toEqual({
      existingFolderIds: ['10'],
      create: { parentFolderId: '11', title: 'Vue' }
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0] as any[];
    const bodyText = call[1]?.body as string;
    expect(bodyText).toContain('https://unknown.example.com/docs/vue');
    expect(bodyText).not.toContain(leak);
    expect(bodyText).toContain('"store":false');
  });
});

