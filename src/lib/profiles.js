import { createInitialState, localDate, normalizeState } from "./budget.js";

export const PROFILE_COLORS = [
  { id: "blue", label: "Ocean", accent: "#3478b8", soft: "#dbeafe" },
  { id: "emerald", label: "Meadow", accent: "#2f806d", soft: "#dff4ec" },
  { id: "violet", label: "Lavender", accent: "#7658a6", soft: "#ede9fe" },
  { id: "amber", label: "Sunset", accent: "#b16b25", soft: "#fef3c7" },
  { id: "rose", label: "Berry", accent: "#b65067", soft: "#ffe4e6" }
];

export const DEFAULT_PROFILE_COLOR = PROFILE_COLORS[0].id;
export const PROFILE_TYPES = ["personal", "business"];

export function createProfileRecord({ id = createId(), name, color = DEFAULT_PROFILE_COLOR, type = "personal", budget }) {
  const normalizedType = PROFILE_TYPES.includes(type) ? type : "personal";
  return {
    id,
    name: normalizeProfileName(name),
    type: normalizedType,
    color: isProfileColor(color) ? color : DEFAULT_PROFILE_COLOR,
    createdAt: localDate(),
    budget: normalizeState(budget ?? createInitialState(normalizedType), normalizedType)
  };
}

export function normalizeProfileStore(value, fallbackBudget = createInitialState()) {
  const profiles = [];
  const usedIds = new Set();

  if (Array.isArray(value?.profiles)) {
    for (const candidate of value.profiles) {
      if (!candidate || typeof candidate.id !== "string" || !candidate.id.trim() || usedIds.has(candidate.id)) continue;
      const type = PROFILE_TYPES.includes(candidate.type) ? candidate.type : "personal";
      usedIds.add(candidate.id);
      profiles.push({
        id: candidate.id,
        name: normalizeProfileName(candidate.name),
        type,
        color: isProfileColor(candidate.color) ? candidate.color : DEFAULT_PROFILE_COLOR,
        createdAt: /^\d{4}-\d{2}-\d{2}$/.test(candidate.createdAt ?? "") ? candidate.createdAt : localDate(),
        budget: normalizeState(candidate.budget ?? candidate.state, type)
      });
    }
  }

  if (!profiles.length) {
    profiles.push(createProfileRecord({ id: "personal", name: "Personal", budget: fallbackBudget }));
  }

  const activeProfileId = profiles.some(({ id }) => id === value?.activeProfileId)
    ? value.activeProfileId
    : profiles[0].id;

  return { version: 1, activeProfileId, profiles };
}

export function getProfileColor(color) {
  return PROFILE_COLORS.find(({ id }) => id === color) ?? PROFILE_COLORS[0];
}

export function getProfileInitials(name) {
  const words = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words.at(-1)[0]}` : words[0]?.slice(0, 2) ?? "P").toUpperCase();
}

function normalizeProfileName(value) {
  const name = typeof value === "string" ? value.trim().slice(0, 32) : "";
  return name || "Personal";
}

function isProfileColor(value) {
  return PROFILE_COLORS.some(({ id }) => id === value);
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}
