<template>
  <main class="popup-container" data-testid="popup-root">
    <!-- 头部 -->
    <header class="header">
      <div class="logo-icon">🔖</div>
      <h1 class="title">Smart Bookmark</h1>
    </header>

    <div class="content">
      <!-- 标题输入框 -->
      <div class="form-group">
        <label class="label">Page Title</label>
        <input
          data-testid="page-title-input"
          v-model="pageTitle"
          class="input-field"
          placeholder="Enter title..."
        />
      </div>

      <!-- 推荐文件夹 -->
      <section class="section">
        <div class="section-header">
          <span class="label">Host Matches</span>
          <span class="badge" v-if="hostRecommendations.length">{{ hostRecommendations.length }} found</span>
        </div>
        
        <div v-if="hostRecommendations.length === 0" class="empty-state">
          No host matches
        </div>
        
        <div class="recommendation-grid">
          <label
            v-for="rec in hostRecommendations"
            :key="rec.folderId"
            class="recommendation-card"
            :class="{ active: selectedFolderId === rec.folderId }"
            data-testid="recommendation-item"
          >
            <input type="radio" name="folder" :value="rec.folderId" v-model="selectedFolderId" class="hidden-radio" />
            <div class="folder-icon">📁</div>
            <div class="folder-info">
              <span class="folder-name">{{ rec.folderTitle }}</span>
              <span class="folder-path">{{ folderPathById[rec.folderId] ?? rec.folderTitle }}</span>
              <span class="folder-count">{{ rec.count }} items</span>
            </div>
            <div class="check-mark" v-if="selectedFolderId === rec.folderId">✓</div>
          </label>
        </div>
      </section>

      <!-- AI 推荐 -->
      <section class="section" v-if="aiRecommendations.length > 0 || aiCreateSuggestion">
        <div class="section-header">
          <span class="label">AI Suggestions</span>
          <span class="badge">{{ aiRecommendations.length + (aiCreateSuggestion ? 1 : 0) }} found</span>
        </div>

        <div v-if="aiCreateSuggestion" class="recommendation-grid" style="margin-bottom: 8px">
          <label
            class="recommendation-card"
            :class="{ active: selectedCreate !== null }"
            data-testid="ai-create-suggestion"
            @click="selectCreateSuggestion"
          >
            <input type="radio" name="folder" :checked="selectedCreate !== null" class="hidden-radio" />
            <div class="folder-icon">🆕</div>
            <div class="folder-info">
              <span class="folder-name">Create folder: {{ aiCreateSuggestion.title }}</span>
              <span class="folder-path">Under: {{ aiCreateSuggestion.parentPath }}</span>
              <span class="folder-count">AI suggestion</span>
            </div>
            <div class="check-mark" v-if="selectedCreate !== null">✓</div>
          </label>
        </div>

        <div v-if="selectedCreate !== null" class="create-editor" data-testid="ai-create-editor">
          <div class="form-group">
            <label class="label">Folder name</label>
            <input
              data-testid="create-folder-title"
              v-model="createFolderTitle"
              class="input-field"
              placeholder="New folder name"
            />
          </div>
          <div class="form-group">
            <label class="label">Parent folder</label>
            <div class="select-wrapper">
              <select
                data-testid="create-folder-parent"
                v-model="createFolderParentId"
                class="select-field"
              >
                <option v-for="f in allFolders" :key="f.id" :value="f.id">{{ f.path }}</option>
              </select>
            </div>
          </div>
          <div class="hint-text">Will create the folder and save the current page into it.</div>
        </div>

        <div class="recommendation-grid">
          <label
            v-for="rec in aiRecommendations"
            :key="rec.folderId"
            class="recommendation-card"
            :class="{ active: selectedFolderId === rec.folderId }"
            data-testid="ai-recommendation-item"
          >
            <input type="radio" name="folder" :value="rec.folderId" v-model="selectedFolderId" class="hidden-radio" />
            <div class="folder-icon">✨</div>
            <div class="folder-info">
              <span class="folder-name">{{ rec.folderTitle }}</span>
              <span class="folder-path">{{ folderPathById[rec.folderId] ?? rec.folderTitle }}</span>
              <span class="folder-count">AI suggestion</span>
            </div>
            <div class="check-mark" v-if="selectedFolderId === rec.folderId">✓</div>
          </label>
        </div>
      </section>

      <!-- 所有文件夹选择 -->
      <section class="section">
        <label class="label">Save to...</label>
        <div class="select-wrapper">
          <select
            data-testid="folder-select"
            v-model="selectedFolderId"
            class="select-field"
          >
            <option value="" disabled>Choose a destination folder</option>
            <option v-for="f in allFolders" :key="f.id" :value="f.id">{{ f.path }}</option>
          </select>
        </div>
      </section>
    </div>

    <!-- 底部操作区 -->
    <footer class="footer">
      <div data-testid="save-status" class="visually-hidden">{{ saveStatus }}</div>
      <div
        v-if="duplicateLocations.length > 0"
        data-testid="duplicate-warning"
        class="status-message warning"
      >
        <div style="font-weight: 600; margin-bottom: 4px">Already bookmarked</div>
        <div v-for="loc in duplicateLocations" :key="loc" style="opacity: 0.9">
          • {{ loc }}
        </div>
      </div>
      <div v-if="saveStatus !== 'idle'" class="status-message" :class="saveStatus">
        <span v-if="saveStatus === 'saving'">⏳ Saving to bookmarks...</span>
        <span v-if="saveStatus === 'saved'">✅ Successfully saved!</span>
        <span v-if="saveStatus === 'error'">❌ Failed to save. Try again.</span>
      </div>

      <button
        data-testid="confirm-save"
        :disabled="!canSave || saveStatus === 'saving'"
        @click="onSave"
        class="save-button"
        :class="{ 'is-loading': saveStatus === 'saving' }"
      >
        {{ saveStatus === 'saving' ? 'Saving...' : 'Save Bookmark' }}
      </button>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { recommendHostFolders } from '../lib/recommendHostFolders';
import { DEFAULT_SETTINGS, loadSettings, type SmartBookmarkSettings } from '../lib/settings';
import { recommendAiSuggestions, type AiCreateFolderSuggestion } from '../lib/aiRecommendFolders';
import { sanitizePageSignals, type PageSignals } from '../lib/pageSignals';

// --- 保持逻辑不变 ---
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
type FolderRecommendation = {
  folderId: string;
  folderTitle: string;
  count?: number;
};
const hostRecommendations = ref<FolderRecommendation[]>([]);
const aiRecommendations = ref<Array<{ folderId: string; folderTitle: string }>>([]);
const aiCreateSuggestion = ref<(AiCreateFolderSuggestion & { parentPath: string }) | null>(null);
const selectedFolderId = ref<string>('');
const allFolders = ref<Array<{ id: string; title: string; path: string }>>([]);
const folderPathById = ref<Record<string, string>>({});
 const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle');
 const duplicateLocations = ref<string[]>([]);
 const settings = ref<SmartBookmarkSettings>(DEFAULT_SETTINGS);
 const selectedCreate = ref<AiCreateFolderSuggestion | null>(null);
 const pageSignals = ref<PageSignals | null>(null);
const createFolderTitle = ref<string>('');
const createFolderParentId = ref<string>('');

const canSave = computed(() => {
  if (!pageUrl.value) return false;
  if (selectedFolderId.value.length > 0) return true;
  if (selectedCreate.value === null) return false;
  return createFolderTitle.value.trim().length > 0 && createFolderParentId.value.trim().length > 0;
});

watch(selectedFolderId, (next) => {
  if (next && next.length > 0) selectedCreate.value = null;
});

watch(selectedCreate, (next) => {
  if (!next) return;
  createFolderTitle.value = next.title;
  createFolderParentId.value = next.parentFolderId;
});

function selectCreateSuggestion(): void {
  if (!aiCreateSuggestion.value) return;
  selectedCreate.value = {
    parentFolderId: aiCreateSuggestion.value.parentFolderId,
    title: aiCreateSuggestion.value.title
  };
  selectedFolderId.value = '';
}

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
  try {
    settings.value = await loadSettings();
  } catch {
    settings.value = DEFAULT_SETTINGS;
  }

  const hasOverrides = Boolean(getQueryParam('url') || getQueryParam('title'));
  const shouldReadSignals =
    settings.value.ai.enabled &&
    !hasOverrides;

  if (shouldReadSignals) {
    try {
      const tabs = await promisify((cb) => chrome.tabs.query({ active: true, currentWindow: true }, cb));
      const tabId = tabs[0]?.id;
      if (typeof tabId === 'number') {
        const injected = await promisify((cb) =>
          chrome.scripting.executeScript(
            {
              target: { tabId },
              func: () => {
                const qMeta = (propOrName: string, kind: 'property' | 'name'): string => {
                  const el = document.querySelector(`meta[${kind}="${propOrName}"]`);
                  const content = (el as any)?.content;
                  return typeof content === 'string' ? content : '';
                };
                const canonical = (document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null)?.href ?? '';
                const h1 = (document.querySelector('h1') as HTMLElement | null)?.innerText ?? '';
                return {
                  metaDescription: qMeta('description', 'name'),
                  ogTitle: qMeta('og:title', 'property'),
                  ogDescription: qMeta('og:description', 'property'),
                  canonicalUrl: canonical,
                  h1
                };
              }
            },
            cb
          )
        );
        const raw = Array.isArray(injected) ? (injected[0] as any)?.result : null;
        pageSignals.value = sanitizePageSignals(raw);
      }
    } catch {
      pageSignals.value = null;
    }
  } else {
    pageSignals.value = null;
  }

  const tree = await promisify((cb) => chrome.bookmarks.getTree(cb));
  const folders: Array<{ id: string; title: string; path: string }> = [];
  const paths: Record<string, string> = {};

  const shouldSkipSegment = (node: any): boolean => {
    const id = String(node?.id ?? '');
    const title = String(node?.title ?? '');
    if (id === '0' || id === '1' || id === '2' || id === '3') return true;
    if (title === '__SB_TEST_ROOT__') return true;
    return title.trim().length === 0;
  };

  const visit = (node: any, segments: string[]) => {
    if (!node) return;
    const nextSegments = shouldSkipSegment(node)
      ? segments
      : [...segments, String(node.title)];

    if (!node.url && node.id && typeof node.title === 'string') {
      if (String(node.id) !== '0') {
        const path = nextSegments.join(' / ');
        folders.push({ id: String(node.id), title: node.title, path });
        paths[String(node.id)] = path;
      }
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) visit(child, nextSegments);
    }
  };
  for (const root of tree as any[]) visit(root, []);
  folders.sort((a, b) => a.path.localeCompare(b.path, 'zh-Hans-CN'));
  allFolders.value = folders;
  folderPathById.value = paths;

  const hostRecs = recommendHostFolders({
    url: pageUrl.value,
    bookmarksTree: tree as any,
    limit: settings.value.topN
  });
  hostRecommendations.value = hostRecs.map((r) => ({ folderId: r.folderId, folderTitle: r.folderTitle, count: r.count }));
  selectedFolderId.value = hostRecommendations.value[0]?.folderId ?? '';

  const shouldAskAi =
    settings.value.ai.enabled &&
    settings.value.ai.apiKey.trim().length > 0 &&
    settings.value.ai.baseUrl.trim().length > 0 &&
    settings.value.ai.model.trim().length > 0 &&
    (settings.value.ai.alwaysSuggest || hostRecommendations.value.length === 0);

  if (shouldAskAi) {
    try {
      const ai = await recommendAiSuggestions({
        baseUrl: settings.value.ai.baseUrl,
        apiKey: settings.value.ai.apiKey,
        model: settings.value.ai.model,
        topN: settings.value.topN,
        pageUrl: pageUrl.value,
        pageTitle: pageTitle.value,
        pageSignals: pageSignals.value,
        folders: folders.map((f) => ({ id: f.id, path: f.path }))
      });
      const byId = new Map(folders.map((f) => [f.id, f] as const));
      const aiRecs = ai.existingFolderIds
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map((f) => ({ folderId: f!.id, folderTitle: f!.title }));

      aiRecommendations.value = aiRecs;

      const create = ai.create;
      if (create && byId.has(create.parentFolderId)) {
        aiCreateSuggestion.value = {
          ...create,
          parentPath: paths[create.parentFolderId] ?? byId.get(create.parentFolderId)!.title
        };
      } else {
        aiCreateSuggestion.value = null;
      }

      if (hostRecommendations.value.length === 0 && aiRecs.length > 0) {
        selectedFolderId.value = aiRecs[0].folderId;
      }
    } catch {
      aiRecommendations.value = [];
      aiCreateSuggestion.value = null;
    }
  } else {
    aiRecommendations.value = [];
    aiCreateSuggestion.value = null;
  }

  try {
    const existing = await promisify((cb) => chrome.bookmarks.search({ url: pageUrl.value }, cb));
    const locs = new Set<string>();
    for (const node of existing as any[]) {
      const parentId = typeof node?.parentId === 'string' ? node.parentId : String(node?.parentId ?? '');
      if (!parentId) continue;
      const path = paths[parentId];
      if (path) locs.add(path);
    }
    duplicateLocations.value = Array.from(locs).slice(0, 3);
  } catch {
    duplicateLocations.value = [];
  }

  if (!selectedFolderId.value) {
    const last = await promisify<Record<string, unknown>>((cb) =>
      chrome.storage.local.get('lastFolderId', cb)
    );
    const lastFolderId = typeof last.lastFolderId === 'string' ? last.lastFolderId : '';
    if (lastFolderId && folders.some((f) => f.id === lastFolderId)) {
      selectedFolderId.value = lastFolderId;
    }
  }
}

async function onSave(): Promise<void> {
  if (!canSave.value) return;
  saveStatus.value = 'saving';
  try {
    let targetFolderId = selectedFolderId.value;
    if (selectedCreate.value) {
      const createdFolder = await promisify((cb) =>
        chrome.bookmarks.create(
          {
            parentId: createFolderParentId.value.trim(),
            title: createFolderTitle.value.trim()
          },
          cb
        )
      );
      targetFolderId = String((createdFolder as any).id ?? '');
    }

    await promisify((cb) =>
      chrome.bookmarks.create(
        { parentId: targetFolderId, title: pageTitle.value, url: pageUrl.value },
        cb
      )
    );
    if (targetFolderId) {
      await promisify((cb) => chrome.storage.local.set({ lastFolderId: targetFolderId }, cb));
    }
    saveStatus.value = 'saved';
    if (settings.value.closeOnSave) {
      setTimeout(() => {
        if (saveStatus.value === 'saved') window.close();
      }, 1500);
    }
  } catch {
    saveStatus.value = 'error';
  }
}

onMounted(async () => {
  await loadPageContext();
  await loadRecommendations();
});

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    window.close();
    return;
  }

  if (event.key === 'Enter') {
    if (!canSave.value || saveStatus.value === 'saving') return;
    event.preventDefault();
    void onSave();
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeyDown, true);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown, true);
});
</script>

<style scoped>
.popup-container,
:global(html),
:global(body),
:global(#app) {
  height: 100%;
}

.popup-container {
  /* 变量定义（放在真实元素上，避免 :host 不生效导致 var() 变透明） */
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --bg-color: #ffffff;
  --text-main: #1f2937;
  --text-muted: #6b7280;
  --border-color: #e5e7eb;
  --radius: 8px;

  min-height: 100vh;
}

.popup-container {
  width: 360px;
  max-height: 600px;
  background: var(--bg-color);
  color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border-color);
}

.logo-icon {
  font-size: 20px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-main);
}

.content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

/* 表单组件 */
.label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.input-field {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* 推荐项卡片式设计 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.badge {
  font-size: 10px;
  background: #eff6ff;
  color: var(--primary-color);
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.recommendation-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
}

.recommendation-card:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.recommendation-card.active {
  border-color: var(--primary-color);
  background: #eff6ff;
}

.hidden-radio {
  position: absolute;
  opacity: 0;
}

.folder-icon {
  font-size: 18px;
}

.folder-info {
  display: flex;
  flex-direction: column;
}

.folder-name {
  font-size: 13px;
  font-weight: 500;
}

.folder-count {
  font-size: 11px;
  color: var(--text-muted);
}

.folder-path {
  font-size: 11px;
  color: var(--text-muted);
}

.check-mark {
  margin-left: auto;
  color: var(--primary-color);
  font-weight: bold;
}

.empty-state {
  font-size: 12px;
  color: var(--text-muted);
  padding: 12px;
  text-align: center;
  background: #f9fafb;
  border-radius: var(--radius);
  border: 1px dashed var(--border-color);
}

/* 下拉框 */
.select-wrapper {
  position: relative;
}

.select-field {
  width: 100%;
  appearance: none;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: white;
  font-size: 14px;
  cursor: pointer;
}

/* 底部区域 */
.footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  background: #f9fafb;
}

.create-editor {
  border: 1px solid var(--border-color);
  background: #ffffff;
  border-radius: var(--radius);
  padding: 10px;
  margin-bottom: 10px;
}

.hint-text {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
}

.save-button {
  width: 100%;
  padding: 10px;
  background: var(--primary-color, #2563eb);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.save-button:hover:not(:disabled) {
  background: var(--primary-hover, #1d4ed8);
}

.save-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.status-message {
  font-size: 12px;
  text-align: center;
  margin-bottom: 12px;
  padding: 6px;
  border-radius: 4px;
}

.status-message.saved { color: #059669; background: #ecfdf5; }
.status-message.error { color: #dc2626; background: #fef2f2; }
.status-message.saving { color: var(--primary-color); }
.status-message.warning { color: #92400e; background: #fffbeb; }

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

</style>
