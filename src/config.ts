import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

export interface GuideModeConfig {
  apiKey?: string
  serverUrl?: string
  username?: string
  tenantId?: string
  tenantName?: string
}

const CONFIG_DIR = join(homedir(), '.guidemode')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')

export async function ensureConfigDir(): Promise<void> {
  try {
    await access(CONFIG_DIR)
  } catch {
    await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 })
  }
}

export async function loadConfig(): Promise<GuideModeConfig> {
  try {
    await ensureConfigDir()
    const content = await readFile(CONFIG_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

export async function saveConfig(config: GuideModeConfig): Promise<void> {
  await ensureConfigDir()
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 })
}

export async function getApiKey(): Promise<string | undefined> {
  // Check environment variable first (for CI/CD)
  if (process.env.GUIDEMODE_API_KEY) {
    return process.env.GUIDEMODE_API_KEY
  }

  const config = await loadConfig()
  return config.apiKey
}

export async function getServerUrl(): Promise<string> {
  // Check environment variable first (for CI/CD)
  if (process.env.GUIDEMODE_SERVICE_URL) {
    return process.env.GUIDEMODE_SERVICE_URL
  }

  const config = await loadConfig()
  return config.serverUrl || 'https://app.guidemode.dev'
}

export async function clearConfig(): Promise<void> {
  await saveConfig({})
}

export async function updateConfig(updates: Partial<GuideModeConfig>): Promise<void> {
  const config = await loadConfig()
  await saveConfig({ ...config, ...updates })
}
