type BookmarkNode = chrome.bookmarks.BookmarkTreeNode;

const TEST_ROOT_TITLE = '__SB_TEST_ROOT__';

function promisify<T>(fn: (cb: (result: T) => void) => void): Promise<T> {
  return new Promise((resolve) => fn(resolve));
}

function promisifyVoid(fn: (cb: () => void) => void): Promise<void> {
  return new Promise((resolve) => fn(resolve));
}

function getTree(): Promise<BookmarkNode[]> {
  return promisify((cb) => chrome.bookmarks.getTree(cb));
}

async function getBookmarksBarId(): Promise<string> {
  const tree = await getTree();
  const root = tree[0];
  const children = root.children ?? [];
  const bar = children.find((c) => c.id === '1') ?? children[0];
  if (!bar) throw new Error('Unable to locate bookmarks bar root');
  return bar.id;
}

async function findChildFolderByTitle(parentId: string, title: string): Promise<BookmarkNode | null> {
  const children = await promisify((cb) => chrome.bookmarks.getChildren(parentId, cb));
  return children.find((c) => !c.url && c.title === title) ?? null;
}

async function createFolder(parentId: string, title: string): Promise<string> {
  const node = await promisify((cb) => chrome.bookmarks.create({ parentId, title }, cb));
  return node.id;
}

async function createBookmark(parentId: string, title: string, url: string): Promise<string> {
  const node = await promisify((cb) => chrome.bookmarks.create({ parentId, title, url }, cb));
  return node.id;
}

async function removeTree(id: string): Promise<void> {
  return promisifyVoid((cb) => chrome.bookmarks.removeTree(id, cb));
}

async function searchByUrl(url: string): Promise<BookmarkNode[]> {
  return promisify((cb) => chrome.bookmarks.search({ url }, cb));
}

let testRootId: string | null = null;

async function ensureTestRoot(): Promise<string> {
  if (testRootId) return testRootId;
  const barId = await getBookmarksBarId();
  const existing = await findChildFolderByTitle(barId, TEST_ROOT_TITLE);
  if (existing) {
    testRootId = existing.id;
    return testRootId;
  }
  testRootId = await createFolder(barId, TEST_ROOT_TITLE);
  return testRootId;
}

async function reset(): Promise<void> {
  const barId = await getBookmarksBarId();
  const existing = await findChildFolderByTitle(barId, TEST_ROOT_TITLE);
  if (existing) {
    await removeTree(existing.id);
  }
  testRootId = await createFolder(barId, TEST_ROOT_TITLE);
}

declare global {
  interface Window {
    __sbHarness?: {
      reset: () => Promise<void>;
      getTestRootId: () => Promise<string>;
      createFolder: (parentId: string, title: string) => Promise<string>;
      createBookmark: (parentId: string, title: string, url: string) => Promise<string>;
      findBookmarksByUrl: (url: string) => Promise<BookmarkNode[]>;
    };
  }
}

window.__sbHarness = {
  reset,
  getTestRootId: ensureTestRoot,
  createFolder,
  createBookmark,
  findBookmarksByUrl: searchByUrl
};

