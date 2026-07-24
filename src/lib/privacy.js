const LOCK_KEY = "cloud-budget-privacy-lock-v1";
const encoder = new TextEncoder();

export function getPrivacyLock() {
  try {
    const value = JSON.parse(localStorage.getItem(LOCK_KEY));
    return value?.salt && value?.hash ? value : null;
  } catch {
    return null;
  }
}

export async function createPrivacyLock(pin) {
  if (!/^\d{4,12}$/.test(pin)) throw new Error("Use a PIN with 4 to 12 digits.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePin(pin, salt);
  const value = { salt: toBase64(salt), hash: toBase64(hash), createdAt: new Date().toISOString() };
  localStorage.setItem(LOCK_KEY, JSON.stringify(value));
  return value;
}

export async function verifyPrivacyPin(pin, value = getPrivacyLock()) {
  if (!value) return true;
  const actual = await derivePin(pin, fromBase64(value.salt));
  const expected = fromBase64(value.hash);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  actual.forEach((byte, index) => { difference |= byte ^ expected[index]; });
  return difference === 0;
}

export function removePrivacyLock() {
  localStorage.removeItem(LOCK_KEY);
}

async function derivePin(pin, salt) {
  const material = await crypto.subtle.importKey("raw", encoder.encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 150_000 },
    material,
    256
  );
  return new Uint8Array(bits);
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
