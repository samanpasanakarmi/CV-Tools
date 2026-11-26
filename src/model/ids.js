// Stable record identifiers, including a fallback for environments without randomUUID.

export function makeId() { return globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
