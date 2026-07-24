const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function encryptBackup(value, password) {
  if (!password) throw new Error("Enter a password for this encrypted backup.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const plaintext = encoder.encode(JSON.stringify(value));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return JSON.stringify({
    format: "cloud-budget-encrypted",
    version: 1,
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(ciphertext))
  }, null, 2);
}

export async function decryptBackup(text, password) {
  const payload = JSON.parse(text);
  if (payload?.format !== "cloud-budget-encrypted" || payload.version !== 1) throw new Error("This is not an encrypted Cloud backup.");
  try {
    const salt = fromBase64(payload.salt);
    const iv = fromBase64(payload.iv);
    const key = await deriveKey(password, salt);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, fromBase64(payload.data));
    return JSON.parse(decoder.decode(plaintext));
  } catch {
    throw new Error("The password is incorrect or the backup is damaged.");
  }
}

export function summarizeBackup(value) {
  const profiles = Array.isArray(value?.profiles) ? value.profiles : [];
  return {
    profiles: profiles.length,
    transactions: profiles.reduce((total, profile) => total + (profile.budget?.transactions?.length ?? 0), 0),
    accounts: profiles.reduce((total, profile) => total + (profile.budget?.accounts?.length ?? 0), 0),
    goals: profiles.reduce((total, profile) => total + (profile.budget?.goals?.length ?? 0), 0)
  };
}

async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 250_000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function toBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function fromBase64(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
