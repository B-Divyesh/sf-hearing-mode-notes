const SLUG = "hearing-mode-notes";
const API = "https://api.sociobot.in/api/v1";
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const DAY = 86_400_000;

interface CachedVerdict {
  valid: boolean;
  checkedAt: number;
  reason?: string;
}

export interface LicenseState {
  unlocked: boolean;
  token: string | null;
  notice: string | null;
}

export const checkoutUrl = `${API}/products/${SLUG}/checkout`;

function cachedVerdict(): CachedVerdict | null {
  try {
    const value = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? "null") as CachedVerdict | null;
    return value && typeof value.valid === "boolean" ? value : null;
  } catch {
    return null;
  }
}

export function captureLicenseFromUrl(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get("license");
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
  url.searchParams.delete("license");
  history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): void {
  const clean = token.trim();
  if (!clean) throw new Error("Paste the license token from your receipt.");
  localStorage.setItem(TOKEN_KEY, clean);
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
}

export function removeLicense(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export function optimisticLicenseState(): LicenseState {
  const token = localStorage.getItem(TOKEN_KEY);
  const verdict = cachedVerdict();
  return { unlocked: Boolean(token && verdict?.valid), token, notice: verdict && !verdict.valid ? "License no longer active." : null };
}

export async function verifyLicense(force = false): Promise<LicenseState> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { unlocked: false, token: null, notice: null };
  const cached = cachedVerdict();
  if (!force && cached && Date.now() - cached.checkedAt < DAY) {
    return { unlocked: cached.valid, token, notice: cached.valid ? null : "License no longer active." };
  }
  try {
    const response = await fetch(`${API}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error("Verification unavailable");
    const body = await response.json() as { valid: boolean; reason?: string };
    const verdict = { valid: body.valid, reason: body.reason, checkedAt: Date.now() };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
    return { unlocked: body.valid, token, notice: body.valid ? null : "License no longer active." };
  } catch {
    return { unlocked: Boolean(cached?.valid), token, notice: cached?.valid ? null : "Could not check the license. The free notebook still works." };
  }
}
