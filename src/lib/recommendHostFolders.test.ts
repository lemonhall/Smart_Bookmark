import { describe, it, expect } from 'vitest';
import { recommendHostFolders } from './recommendHostFolders';

type BookmarkNode = {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
};

describe('recommendHostFolders', () => {
  it('ranks folders by same-host bookmark count', () => {
    const tree: BookmarkNode[] = [
      {
        id: '0',
        title: 'root',
        children: [
          {
            id: '10',
            title: 'AI工具',
            children: [
              { id: 'b1', title: 'a1', url: 'https://github.com/nicepkg/aide' },
              { id: 'b2', title: 'a2', url: 'https://github.com/nicepkg/gpt-runner' }
            ]
          },
          {
            id: '11',
            title: 'Linux',
            children: [{ id: 'b3', title: 'l1', url: 'https://github.com/torvalds/linux' }]
          }
        ]
      }
    ];

    const result = recommendHostFolders({
      url: 'https://github.com/vuejs/vue',
      bookmarksTree: tree,
      limit: 3
    });

    expect(result.map((r) => r.folderTitle)).toEqual(['AI工具', 'Linux']);
    expect(result[0].count).toBe(2);
    expect(result[1].count).toBe(1);
  });

  it('returns empty when host has no matches', () => {
    const tree: BookmarkNode[] = [
      {
        id: '0',
        title: 'root',
        children: [
          {
            id: '10',
            title: 'AI工具',
            children: [{ id: 'b1', title: 'a1', url: 'https://github.com/nicepkg/aide' }]
          }
        ]
      }
    ];

    const result = recommendHostFolders({
      url: 'https://example.com',
      bookmarksTree: tree,
      limit: 3
    });

    expect(result).toEqual([]);
  });

  it('falls back to parent domain when exact host has no matches', () => {
    const tree: BookmarkNode[] = [
      {
        id: '0',
        title: 'root',
        children: [
          {
            id: '10',
            title: 'Docs',
            children: [{ id: 'b1', title: 'd1', url: 'https://example.com/guide' }]
          }
        ]
      }
    ];

    const result = recommendHostFolders({
      url: 'https://docs.example.com/getting-started',
      bookmarksTree: tree,
      limit: 3
    });

    expect(result.map((r) => r.folderTitle)).toEqual(['Docs']);
    expect(result[0].count).toBe(1);
  });

  it('falls back to registrable domain for deep subdomains (eTLD+1)', () => {
    const tree: BookmarkNode[] = [
      {
        id: '0',
        title: 'root',
        children: [
          {
            id: '10',
            title: 'Example',
            children: [{ id: 'b1', title: 'e1', url: 'https://example.com/welcome' }]
          }
        ]
      }
    ];

    const result = recommendHostFolders({
      url: 'https://a.b.example.com/getting-started',
      bookmarksTree: tree,
      limit: 3
    });

    expect(result.map((r) => r.folderTitle)).toEqual(['Example']);
    expect(result[0].count).toBe(1);
  });
});
