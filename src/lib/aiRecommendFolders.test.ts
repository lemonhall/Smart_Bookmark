import { describe, expect, it, vi } from 'vitest';
import { parseAiFolderIds, recommendAiFolderIds } from './aiRecommendFolders';

describe('parseAiFolderIds', () => {
  it('parses plain JSON', () => {
    expect(parseAiFolderIds('{"folderIds":["a","b"]}', 3)).toEqual(['a', 'b']);
  });

  it('extracts JSON from mixed text', () => {
    const text = 'Sure! {"folderIds":["x"]}\n';
    expect(parseAiFolderIds(text, 3)).toEqual(['x']);
  });

  it('enforces topN', () => {
    expect(parseAiFolderIds('{"folderIds":["a","b","c"]}', 2)).toEqual(['a', 'b']);
  });

  it('returns empty for invalid payloads', () => {
    expect(parseAiFolderIds('not json', 3)).toEqual([]);
    expect(parseAiFolderIds('{"folderIds":"nope"}', 3)).toEqual([]);
  });
});

describe('recommendAiFolderIds', () => {
  it('posts minimal payload and parses folderIds', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: '{"folderIds":["10","11"]}' }]
          }
        ]
      })
    });
    // @ts-expect-error test stub
    globalThis.fetch = fetchMock;

    const leak = 'https://secret.example.com/private';
    const result = await recommendAiFolderIds({
      baseUrl: 'https://api.openai.com/v1',
      apiKey: 'sk-test',
      model: 'gpt-4o-mini',
      topN: 3,
      pageUrl: 'https://unknown.example.com/docs/vue',
      pageTitle: 'Vue',
      folders: [
        { id: '10', path: '书签栏 / 前端' },
        { id: '11', path: '书签栏 / Linux' }
      ]
    });

    expect(result).toEqual(['10', '11']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0] as any[];
    const bodyText = call[1]?.body as string;
    expect(bodyText).toContain('https://unknown.example.com/docs/vue');
    expect(bodyText).not.toContain(leak);
    expect(bodyText).toContain('"store":false');
  });
});
