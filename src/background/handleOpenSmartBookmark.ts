export type HandleOpenSmartBookmarkDeps = {
  actionOpenPopup: () => Promise<void>;
  tabsQueryActive: () => Promise<{ url?: string; title?: string } | null>;
  tabsCreate: (url: string) => Promise<void>;
  runtimeGetURL: (path: string) => string;
};

export async function handleOpenSmartBookmark(
  deps: HandleOpenSmartBookmarkDeps
): Promise<void> {
  try {
    await deps.actionOpenPopup();
    return;
  } catch {
    // fallback below
  }

  const active = await deps.tabsQueryActive();
  const url = active?.url ?? '';
  const title = active?.title ?? '';

  const query = new URLSearchParams();
  if (url) query.set('url', url);
  if (title) query.set('title', title);

  const target = deps.runtimeGetURL(`popup.html?${query.toString()}`);
  await deps.tabsCreate(target);
}

