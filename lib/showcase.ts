// Real runs picked to show what Openpath does. Set OPENPATH_SHOWCASE to a JSON list:
// [{"id":"<run id>","title":"Short title","note":"One line on why it matters"}]
export type ShowcaseEntry = { id: string; title: string; note?: string };

export function showcaseEntries(): ShowcaseEntry[] {
  try {
    const raw = JSON.parse(process.env.OPENPATH_SHOWCASE ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((e) => e && typeof e.id === "string" && typeof e.title === "string")
      .slice(0, 8)
      .map((e) => ({ id: e.id, title: String(e.title).slice(0, 80), note: e.note ? String(e.note).slice(0, 220) : undefined }));
  } catch {
    return [];
  }
}
