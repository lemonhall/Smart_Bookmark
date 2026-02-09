<template>
  <main class="page">
    <header class="header">
      <h1 class="title">Smart Bookmark — Options</h1>
      <p class="subtitle">Settings are stored locally in your browser profile.</p>
    </header>

    <section class="card">
      <h2 class="card-title">General</h2>

      <div class="row">
        <label class="label" for="topN">Recommended folders (Top N)</label>
        <input id="topN" class="input" type="number" min="1" max="10" step="1" v-model.number="topN" />
      </div>

      <div class="row">
        <label class="label" for="closeOnSave">Close popup after saving</label>
        <input id="closeOnSave" type="checkbox" v-model="closeOnSave" />
      </div>

      <div class="row">
        <button class="link" type="button" @click="openShortcuts">Open Chrome shortcuts</button>
        <span class="hint">Configure the extension hotkey in Chrome.</span>
      </div>
    </section>

    <section class="card">
      <h2 class="card-title">AI Fallback (OpenAI-compatible)</h2>

      <div class="row">
        <label class="label" for="aiEnabled">Enable AI fallback</label>
        <input id="aiEnabled" type="checkbox" v-model="aiEnabled" />
      </div>

      <div class="row">
        <label class="label" for="endpointUrl">Endpoint URL</label>
        <input
          id="endpointUrl"
          class="input"
          type="text"
          placeholder="https://api.openai.com/v1/chat/completions"
          v-model.trim="endpointUrl"
        />
      </div>

      <div class="row">
        <label class="label" for="model">Model</label>
        <input id="model" class="input" type="text" placeholder="gpt-4o-mini" v-model.trim="model" />
      </div>

      <div class="row">
        <label class="label" for="apiKey">API Key</label>
        <input
          id="apiKey"
          class="input"
          type="password"
          placeholder="sk-..."
          v-model="apiKey"
          autocomplete="off"
        />
      </div>

      <p class="hint">
        Only sent when AI is enabled and host-based recommendations are empty. The request includes the current tab
        URL/title and folder candidates (id/path) — it does not upload existing bookmark URLs.
      </p>
    </section>

    <footer class="footer">
      <div class="status" :class="status.kind" v-if="status.kind !== 'idle'">{{ status.message }}</div>
      <div class="actions">
        <button class="button secondary" type="button" @click="onReset" :disabled="saving">Reset</button>
        <button class="button" type="button" @click="onSave" :disabled="saving">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../lib/settings';

const topN = ref<number>(DEFAULT_SETTINGS.topN);
const closeOnSave = ref<boolean>(DEFAULT_SETTINGS.closeOnSave);
const aiEnabled = ref<boolean>(DEFAULT_SETTINGS.ai.enabled);
const endpointUrl = ref<string>(DEFAULT_SETTINGS.ai.endpointUrl);
const model = ref<string>(DEFAULT_SETTINGS.ai.model);
const apiKey = ref<string>(DEFAULT_SETTINGS.ai.apiKey);

const saving = ref(false);
const status = reactive<{ kind: 'idle' | 'ok' | 'error'; message: string }>({ kind: 'idle', message: '' });

function setStatus(kind: 'idle' | 'ok' | 'error', message: string) {
  status.kind = kind;
  status.message = message;
}

async function openShortcuts() {
  try {
    await chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  } catch {
    setStatus('error', 'Unable to open chrome://extensions/shortcuts');
  }
}

async function onSave() {
  saving.value = true;
  setStatus('idle', '');
  try {
    await saveSettings({
      topN: topN.value,
      closeOnSave: closeOnSave.value,
      ai: {
        enabled: aiEnabled.value,
        endpointUrl: endpointUrl.value,
        model: model.value,
        apiKey: apiKey.value
      }
    });
    setStatus('ok', 'Saved');
  } catch {
    setStatus('error', 'Save failed');
  } finally {
    saving.value = false;
  }
}

async function onReset() {
  topN.value = DEFAULT_SETTINGS.topN;
  closeOnSave.value = DEFAULT_SETTINGS.closeOnSave;
  aiEnabled.value = DEFAULT_SETTINGS.ai.enabled;
  endpointUrl.value = DEFAULT_SETTINGS.ai.endpointUrl;
  model.value = DEFAULT_SETTINGS.ai.model;
  apiKey.value = DEFAULT_SETTINGS.ai.apiKey;
  await onSave();
}

onMounted(async () => {
  try {
    const s = await loadSettings();
    topN.value = s.topN;
    closeOnSave.value = s.closeOnSave;
    aiEnabled.value = s.ai.enabled;
    endpointUrl.value = s.ai.endpointUrl;
    model.value = s.ai.model;
    apiKey.value = s.ai.apiKey;
  } catch {
    setStatus('error', 'Failed to load settings');
  }
});
</script>

<style scoped>
.page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #111827;
  padding: 16px;
  max-width: 720px;
  margin: 0 auto;
}

.header {
  margin-bottom: 12px;
}

.title {
  font-size: 18px;
  margin: 0;
}

.subtitle {
  margin: 6px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
  background: #ffffff;
  margin: 12px 0;
}

.card-title {
  margin: 0 0 10px;
  font-size: 14px;
}

.row {
  display: grid;
  grid-template-columns: 220px 1fr;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.label {
  font-size: 12px;
  color: #374151;
}

.input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
}

.hint {
  font-size: 12px;
  color: #6b7280;
  margin: 10px 0 0;
}

.link {
  padding: 0;
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  text-align: left;
}

.footer {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.actions {
  display: flex;
  gap: 8px;
}

.button {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.button.secondary {
  background: #f3f4f6;
  color: #111827;
  border: 1px solid #e5e7eb;
}

.status {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 8px;
}

.status.ok {
  background: #ecfdf5;
  color: #059669;
}

.status.error {
  background: #fef2f2;
  color: #dc2626;
}

@media (max-width: 520px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>

