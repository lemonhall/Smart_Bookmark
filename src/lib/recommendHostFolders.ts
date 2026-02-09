import { getDomain } from 'tldts';

type BookmarkNode = {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
};

export type RecommendHostFoldersInput = {
  url: string;
  bookmarksTree: BookmarkNode[];
  limit: number;
};

export type HostFolderRecommendation = {
  folderId: string;
  folderTitle: string;
  count: number;
};

function computeCountsForHost(
  bookmarksTree: BookmarkNode[],
  targetHost: string
): HostFolderRecommendation[] {
  const counts = new Map<string, HostFolderRecommendation>();

  const visit = (node: BookmarkNode, currentFolder: BookmarkNode | null) => {
    if (node.url) {
      try {
        const host = new URL(node.url).hostname;
        if (host === targetHost && currentFolder) {
          const existing = counts.get(currentFolder.id);
          if (existing) {
            existing.count += 1;
          } else {
            counts.set(currentFolder.id, {
              folderId: currentFolder.id,
              folderTitle: currentFolder.title,
              count: 1
            });
          }
        }
      } catch {
        // ignore invalid bookmark urls
      }
      return;
    }

    if (!node.children) return;

    const nextFolder = node.children.length > 0 ? node : currentFolder;
    for (const child of node.children) visit(child, nextFolder);
  };

  for (const root of bookmarksTree) visit(root, null);

  return Array.from(counts.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.folderTitle.localeCompare(b.folderTitle, 'zh-Hans-CN');
  });
}

function parentDomainOnce(hostname: string): string | null {
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length <= 2) return null;
  return parts.slice(1).join('.');
}

export function recommendHostFolders(input: RecommendHostFoldersInput): HostFolderRecommendation[] {
  let targetHost: string;
  try {
    targetHost = new URL(input.url).hostname;
  } catch {
    return [];
  }

  let ranked = computeCountsForHost(input.bookmarksTree, targetHost);
  if (ranked.length === 0) {
    const domain = getDomain(targetHost);
    if (domain && domain !== targetHost) {
      ranked = computeCountsForHost(input.bookmarksTree, domain);
    }

    if (ranked.length === 0) {
      const parent = parentDomainOnce(targetHost);
      if (parent && parent !== domain) ranked = computeCountsForHost(input.bookmarksTree, parent);
    }
  }

  return ranked.slice(0, input.limit);
}
