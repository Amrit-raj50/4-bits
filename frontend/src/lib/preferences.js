const KEY = "tlw:reduce-motion";

export function getReduceMotion() {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(KEY);
  if (stored !== null) return stored === "1";
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function setReduceMotion(value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, value ? "1" : "0");
  window.dispatchEvent(new CustomEvent("tlw:reduce-motion", { detail: value }));
}

export function subscribeReduceMotion(cb) {
  if (typeof window === "undefined") return () => {};
  const handler = (e) => cb(e.detail);
  window.addEventListener("tlw:reduce-motion", handler);
  return () => window.removeEventListener("tlw:reduce-motion", handler);
}