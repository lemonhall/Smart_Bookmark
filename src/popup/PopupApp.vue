<template>
  <main data-testid="popup-root" style="min-width: 360px; padding: 12px; font-family: system-ui">
    <h1 style="font-size: 14px; margin: 0 0 8px">Smart Bookmark</h1>

    <label style="display: block; font-size: 12px; opacity: 0.85; margin-bottom: 4px">Title</label>
    <input
      data-testid="page-title-input"
      v-model="pageTitle"
      style="width: 100%; box-sizing: border-box; padding: 6px 8px; margin-bottom: 10px"
    />

    <section style="margin-bottom: 10px">
      <div style="font-size: 12px; opacity: 0.85; margin-bottom: 6px">Recommended folders</div>
      <div v-if="recommendations.length === 0" style="font-size: 12px; opacity: 0.7">
        No host matches
      </div>
      <label
        v-for="rec in recommendations"
        :key="rec.folderId"
        data-testid="recommendation-item"
        style="
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 12px;
          padding: 4px 0;
          cursor: pointer;
        "
      >
        <input type="radio" name="folder" :value="rec.folderId" v-model="selectedFolderId" />
        <span>{{ rec.folderTitle }}</span>
        <span style="opacity: 0.6">({{ rec.count }})</span>
      </label>
    </section>

    <section style="margin-bottom: 10px">
      <div style="font-size: 12px; opacity: 0.85; margin-bottom: 6px">All folders</div>
      <select
        data-testid="folder-select"
        v-model="selectedFolderId"
        style="width: 100%; box-sizing: border-box; padding: 6px 8px"
      >
        <option value="" disabled>Select a folder…</option>
        <option v-for="f in allFolders" :key="f.id" :value="f.id">{{ f.title }}</option>
      </select>
    </section>

    <button
      data-testid="confirm-save"
      :disabled="!canSave || saveStatus === 'saving'"
      @click="onSave"
      style="width: 100%; padding: 8px; font-size: 12px"
    >
      {{ saveStatus === 'saving' ? 'Saving…' : 'Save bookmark' }}
    </button>

    <div data-testid="save-status" style="margin-top: 8px; font-size: 12px; opacity: 0.75">
      {{ saveStatus }}
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { recommendHostFolders, type HostFolderRecommendation } from '../lib/recommendHostFolders';

function getQueryParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(name);
  return value && value.length > 0 ? value : null;
}

function promisify<T>(fn: (cb: (result: T) => void) => void): Promise<T> {
  return new Promise((resolve) => fn(resolve));
}

const pageUrl = ref<string>('');
const pageTitle = ref<string>('');

const recommendations = ref<HostFolderRecommendation[]>([]);
const selectedFolderId = ref<string>('');
const allFolders = ref<Array<{ id: string; title: string }>>([]);

const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle');

const canSave = computed(() => pageUrl.value.length > 0 && selectedFolderId.value.length > 0);

async function loadPageContext(): Promise<void> {
  const urlOverride = getQueryParam('url');
  const titleOverride = getQueryParam('title');
  if (urlOverride) pageUrl.value = urlOverride;
  if (titleOverride) pageTitle.value = titleOverride;

  if (pageUrl.value && pageTitle.value) return;

  const tabs = await promisify((cb) => chrome.tabs.query({ active: true, currentWindow: true }, cb));
  const tab = tabs[0];
  if (tab?.url) pageUrl.value = tab.url;
  if (tab?.title) pageTitle.value = tab.title;
}

async function loadRecommendations(): Promise<void> {
  if (!pageUrl.value) return;
  const tree = await promisify((cb) => chrome.bookmarks.getTree(cb));

  const folders: Array<{ id: string; title: string }> = [];
  const visit = (node: any) => {
    if (!node) return;
    if (!node.url && node.id && typeof node.title === 'string') {
      if (node.id !== '0') folders.push({ id: String(node.id), title: node.title });
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) visit(child);
    }
  };
  for (const root of tree as any[]) visit(root);
  allFolders.value = folders;

  recommendations.value = recommendHostFolders({
    url: pageUrl.value,
    // chrome bookmark nodes are compatible with our minimal shape
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bookmarksTree: tree as any,
    limit: 3
  });
  selectedFolderId.value = recommendations.value[0]?.folderId ?? '';
}

async function onSave(): Promise<void> {
  if (!canSave.value) return;
  saveStatus.value = 'saving';
  try {
    await promisify((cb) =>
      chrome.bookmarks.create(
        { parentId: selectedFolderId.value, title: pageTitle.value, url: pageUrl.value },
        cb
      )
    );
    saveStatus.value = 'saved';
  } catch {
    saveStatus.value = 'error';
  }
}

onMounted(async () => {
  await loadPageContext();
  await loadRecommendations();
});
</script>
