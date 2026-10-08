/**
 * Respons API kadang berbentuk `data: [...]`, kadang `data: { lost_founds: [...] }`.
 * Dua helper ini memastikan UI selalu menerima bentuk yang benar.
 */
export function extractList(data, keys = []) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    for (const key of keys) {
      if (Array.isArray(data[key])) return data[key];
    }
    const firstArray = Object.values(data).find(Array.isArray);
    if (firstArray) return firstArray;
  }
  return [];
}

export function extractItem(data, keys = []) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  for (const key of keys) {
    if (data[key] && typeof data[key] === "object") return data[key];
  }
  return data;
}

export function getInitial(name) {
  return name ? String(name).trim().charAt(0).toUpperCase() || "?" : "?";
}
