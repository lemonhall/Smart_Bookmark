import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium, type BrowserContext } from '@playwright/test';

function normalizePath(value: string): string {
  return path.resolve(value).replaceAll('/', '\\').toLowerCase();
}

function findExtensionIdInPreferences(userDataDir: string, extensionPath: string): string | null {
  const targetPath = normalizePath(extensionPath);
  const prefCandidates = [
    path.join(userDataDir, 'Default', 'Secure Preferences'),
    path.join(userDataDir, 'Default', 'Preferences')
  ];

  for (const prefPath of prefCandidates) {
    if (!fs.existsSync(prefPath)) continue;
    try {
      const pref = JSON.parse(fs.readFileSync(prefPath, 'utf8')) as any;
      const settings = pref?.extensions?.settings;
      if (!settings || typeof settings !== 'object') continue;

      for (const [id, data] of Object.entries(settings as Record<string, any>)) {
        const candidatePath = data?.path;
        if (typeof candidatePath !== 'string') continue;
        if (normalizePath(candidatePath) === targetPath) return id;
      }
    } catch {
      // ignore transient parse issues while Chrome writes the file
    }
  }

  return null;
}

function findLocalChromiumExecutable(): string | null {
  const pwExecutable = chromium.executablePath();
  if (pwExecutable && fs.existsSync(pwExecutable)) return pwExecutable;

  const candidates: Array<string | undefined> = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium-1161', 'chrome-win', 'chrome.exe')
      : undefined
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export async function launchExtensionContext(): Promise<{
  context: BrowserContext;
  extensionId: string;
  userDataDir: string;
}> {
  const extensionPath = path.resolve(process.cwd(), 'dist');

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'smart-bookmark-pw-'));

  const executablePath = findLocalChromiumExecutable();
  if (!executablePath) {
    throw new Error(
      'No Chromium executable available for extension E2E. ' +
        'Run `npx playwright install chromium` or set PLAYWRIGHT_CHROMIUM_EXECUTABLE.'
    );
  }

  const baseOptions = {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ],
    // Playwright's default Chromium args include `--disable-extensions`,
    // which prevents loading unpacked extensions unless we opt it out.
    ignoreDefaultArgs: ['--disable-extensions'],
    executablePath
  } as const;

  const context = await chromium.launchPersistentContext(userDataDir, baseOptions);

  let extensionId: string | null = null;
  for (let attempt = 0; attempt < 80; attempt++) {
    extensionId = findExtensionIdInPreferences(userDataDir, extensionPath);
    if (extensionId) break;
    await new Promise((r) => setTimeout(r, 250));
  }

  if (!extensionId) {
    throw new Error(`Unable to locate extension id for path: ${extensionPath}`);
  }

  return { context, extensionId, userDataDir };
}
