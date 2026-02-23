// Data store for OdinBOT panel - uses in-memory store with localStorage sync for the panel
// On the VPS, the Go bot uses SQLite directly

export interface GroupConfig {
  id: string
  name: string
  jid: string
  welcome: boolean
  welcomeMsg: string
  goodbye: boolean
  goodbyeMsg: string
  antilink: boolean
  antifake: boolean
  antiflood: boolean
  nsfw: boolean
  autoSticker: boolean
  prefix: string
  mutedUsers: string[]
  active: boolean
}

export interface Rental {
  id: string
  groupJid: string
  groupName: string
  ownerNumber: string
  ownerName: string
  plan: string
  startDate: string
  endDate: string
  value: number
  active: boolean
  notes: string
}

export interface Warning {
  id: string
  groupJid: string
  userJid: string
  userName: string
  reason: string
  date: string
  issuedBy: string
}

export interface BlacklistEntry {
  id: string
  number: string
  reason: string
  date: string
  addedBy: string
}

export interface ScheduledMessage {
  id: string
  groupJid: string
  groupName: string
  message: string
  time: string
  frequency: "once" | "daily" | "weekly" | "monthly"
  active: boolean
  imageUrl?: string
}

export interface BotSettings {
  botName: string
  ownerName: string
  ownerNumber: string
  prefix: string
  autoRead: boolean
  maxWarnings: number
  welcomeDefault: string
  goodbyeDefault: string
}

export const DEFAULT_SETTINGS: BotSettings = {
  botName: "OdinBOT",
  ownerName: "Erick Machine",
  ownerNumber: "5592996529610",
  prefix: "#",
  autoRead: true,
  maxWarnings: 3,
  welcomeDefault: "Bem-vindo(a) ao grupo! Leia as regras e divirta-se.",
  goodbyeDefault: "Ate mais! Sentiremos sua falta.",
}

const STORAGE_KEYS = {
  groups: "odinbot_groups",
  rentals: "odinbot_rentals",
  warnings: "odinbot_warnings",
  blacklist: "odinbot_blacklist",
  scheduled: "odinbot_scheduled",
  settings: "odinbot_settings",
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable
  }
}

// Groups
export function getGroups(): GroupConfig[] {
  return safeGet<GroupConfig[]>(STORAGE_KEYS.groups, [])
}
export function saveGroups(groups: GroupConfig[]): void {
  safeSet(STORAGE_KEYS.groups, groups)
}
export function addGroup(group: GroupConfig): void {
  const groups = getGroups()
  groups.push(group)
  saveGroups(groups)
}
export function updateGroup(id: string, updates: Partial<GroupConfig>): void {
  const groups = getGroups()
  const idx = groups.findIndex((g) => g.id === id)
  if (idx !== -1) {
    groups[idx] = { ...groups[idx], ...updates }
    saveGroups(groups)
  }
}
export function deleteGroup(id: string): void {
  saveGroups(getGroups().filter((g) => g.id !== id))
}

// Rentals
export function getRentals(): Rental[] {
  return safeGet<Rental[]>(STORAGE_KEYS.rentals, [])
}
export function saveRentals(rentals: Rental[]): void {
  safeSet(STORAGE_KEYS.rentals, rentals)
}
export function addRental(rental: Rental): void {
  const rentals = getRentals()
  rentals.push(rental)
  saveRentals(rentals)
}
export function updateRental(id: string, updates: Partial<Rental>): void {
  const rentals = getRentals()
  const idx = rentals.findIndex((r) => r.id === id)
  if (idx !== -1) {
    rentals[idx] = { ...rentals[idx], ...updates }
    saveRentals(rentals)
  }
}
export function deleteRental(id: string): void {
  saveRentals(getRentals().filter((r) => r.id !== id))
}

// Warnings
export function getWarnings(): Warning[] {
  return safeGet<Warning[]>(STORAGE_KEYS.warnings, [])
}
export function saveWarnings(warnings: Warning[]): void {
  safeSet(STORAGE_KEYS.warnings, warnings)
}
export function addWarning(warning: Warning): void {
  const warnings = getWarnings()
  warnings.push(warning)
  saveWarnings(warnings)
}
export function deleteWarning(id: string): void {
  saveWarnings(getWarnings().filter((w) => w.id !== id))
}

// Blacklist
export function getBlacklist(): BlacklistEntry[] {
  return safeGet<BlacklistEntry[]>(STORAGE_KEYS.blacklist, [])
}
export function saveBlacklist(list: BlacklistEntry[]): void {
  safeSet(STORAGE_KEYS.blacklist, list)
}
export function addToBlacklist(entry: BlacklistEntry): void {
  const list = getBlacklist()
  list.push(entry)
  saveBlacklist(list)
}
export function removeFromBlacklist(id: string): void {
  saveBlacklist(getBlacklist().filter((b) => b.id !== id))
}

// Scheduled Messages
export function getScheduledMessages(): ScheduledMessage[] {
  return safeGet<ScheduledMessage[]>(STORAGE_KEYS.scheduled, [])
}
export function saveScheduledMessages(msgs: ScheduledMessage[]): void {
  safeSet(STORAGE_KEYS.scheduled, msgs)
}
export function addScheduledMessage(msg: ScheduledMessage): void {
  const msgs = getScheduledMessages()
  msgs.push(msg)
  saveScheduledMessages(msgs)
}
export function deleteScheduledMessage(id: string): void {
  saveScheduledMessages(getScheduledMessages().filter((m) => m.id !== id))
}

// Settings
export function getSettings(): BotSettings {
  return safeGet<BotSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
}
export function saveSettings(settings: BotSettings): void {
  safeSet(STORAGE_KEYS.settings, settings)
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}
