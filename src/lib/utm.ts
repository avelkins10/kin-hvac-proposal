export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

const UTM_STORAGE_KEY = "kin_utm_params";

export function storeUTMParams(params: UTMParams): void {
  if (typeof window === "undefined") return;
  const existing = getStoredUTMParams();
  // Only store on first visit (don't overwrite)
  if (!existing) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
  }
}

export function getStoredUTMParams(): UTMParams | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UTMParams;
  } catch {
    return null;
  }
}

export function mergeUTMParams(fromURL: UTMParams): UTMParams {
  const stored = getStoredUTMParams();
  return stored ?? fromURL;
}
