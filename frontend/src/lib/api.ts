const RAW_BASE = (import.meta.env.VITE_API_URL ?? "").trim();
const API_BASE = RAW_BASE.replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalized}` : normalized;
}
