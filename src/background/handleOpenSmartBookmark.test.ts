import { describe, it, expect, vi } from 'vitest';
import { handleOpenSmartBookmark } from './handleOpenSmartBookmark';

describe('handleOpenSmartBookmark', () => {
  it('falls back to opening a tab with popup.html when openPopup fails', async () => {
    const actionOpenPopup = vi.fn().mockRejectedValue(new Error('blocked'));
    const tabsQueryActive = vi.fn().mockResolvedValue({
      url: 'https://example.com/a?b=1',
      title: 'Hello'
    });
    const tabsCreate = vi.fn().mockResolvedValue(undefined);
    const runtimeGetURL = vi.fn((p: string) => `chrome-extension://id/${p}`);

    await handleOpenSmartBookmark({
      actionOpenPopup,
      tabsQueryActive,
      tabsCreate,
      runtimeGetURL
    });

    expect(actionOpenPopup).toHaveBeenCalledTimes(1);
    expect(tabsQueryActive).toHaveBeenCalledTimes(1);
    expect(runtimeGetURL).toHaveBeenCalledTimes(1);
    expect(tabsCreate).toHaveBeenCalledTimes(1);

    const openedUrl = tabsCreate.mock.calls[0][0] as string;
    expect(openedUrl).toContain('popup.html?');
    expect(openedUrl).toContain('url=');
    expect(openedUrl).toContain('title=');
  });
});

