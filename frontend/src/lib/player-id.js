const KEY = "tlw:player-id";
const NAME_KEY = "tlw:player-name";

export function getPlayerId() {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

export function getStoredName() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(NAME_KEY) ?? "";
}

export function setStoredName(name) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NAME_KEY, name);
}