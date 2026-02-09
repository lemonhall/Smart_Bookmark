import { handleOpenSmartBookmark } from './background/handleOpenSmartBookmark';

function promisify<T>(fn: (cb: (result: T) => void) => void): Promise<T> {
  return new Promise((resolve) => fn(resolve));
}

chrome.commands.onCommand.addListener((command) => {
  if (command !== 'open-smart-bookmark') return;
  void handleOpenSmartBookmark({
    actionOpenPopup: () => chrome.action.openPopup(),
    tabsQueryActive: async () => {
      const tabs = await promisify((cb) =>
        chrome.tabs.query({ active: true, currentWindow: true }, cb)
      );
      const tab = tabs[0];
      if (!tab) return null;
      return { url: tab.url, title: tab.title };
    },
    tabsCreate: (url: string) => promisify((cb) => chrome.tabs.create({ url }, () => cb(undefined))),
    runtimeGetURL: (path: string) => chrome.runtime.getURL(path)
  });
});
