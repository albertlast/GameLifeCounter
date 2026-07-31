export const STORAGE_KEY = 'glc.state.v2'

/** Keys written by the pre-revamp two-player version. */
const LEGACY_KEYS = {
  p1Life: 'glcfirst.life',
  p2Life: 'glcsecond.life',
  p1Hue: 'glcP1Hue.Color',
  p2Hue: 'glcP2Hue.Color',
} as const

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    // Storage can throw when cookies/site data are blocked.
    return null
  }
}

export function readJson<T>(key: string): T | null {
  const store = storage()
  if (!store) return null
  try {
    const raw = store.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  const store = storage()
  if (!store) return
  try {
    store.setItem(key, JSON.stringify(value))
  } catch {
    // Quota or privacy mode: the app stays usable without persistence.
  }
}

export function removeKey(key: string): void {
  const store = storage()
  if (!store) return
  try {
    store.removeItem(key)
  } catch {
    // ignore
  }
}

export interface LegacySnapshot {
  lives: [number, number]
  hues: [number, number]
}

function readLegacyNumber(key: string): number | null {
  const store = storage()
  if (!store) return null
  try {
    const raw = store.getItem(key)
    if (raw === null) return null
    const value = Number.parseFloat(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

/**
 * Reads the two-player data written by earlier releases so returning users
 * keep their life totals and colours. Returns null when nothing is stored.
 */
export function readLegacyState(): LegacySnapshot | null {
  const p1Life = readLegacyNumber(LEGACY_KEYS.p1Life)
  const p2Life = readLegacyNumber(LEGACY_KEYS.p2Life)
  const p1Hue = readLegacyNumber(LEGACY_KEYS.p1Hue)
  const p2Hue = readLegacyNumber(LEGACY_KEYS.p2Hue)

  if (p1Life === null && p2Life === null && p1Hue === null && p2Hue === null) {
    return null
  }

  return {
    lives: [p1Life ?? 20, p2Life ?? 20],
    hues: [p1Hue ?? 32, p2Hue ?? 222],
  }
}

export function clearLegacyState(): void {
  Object.values(LEGACY_KEYS).forEach(removeKey)
}
