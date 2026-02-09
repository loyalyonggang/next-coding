export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
};

export type TodoFilter = "all" | "active" | "completed";

export function uid(prefix = "t"): string {
  // Good enough for local-only usage.
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function clampTitle(input: string): string {
  return input.replace(/\s+/g, " ").trim().slice(0, 200);
}

export function loadTodos(storageKey: string): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((t: unknown) => {
        if (!t || typeof t !== "object") return null;
        const obj = t as Record<string, unknown>;
        if (typeof obj.id !== "string" || typeof obj.title !== "string") return null;
        return {
          id: obj.id,
          title: obj.title,
          completed: Boolean(obj.completed),
          createdAt: typeof obj.createdAt === "number" ? obj.createdAt : Date.now(),
          updatedAt: typeof obj.updatedAt === "number" ? obj.updatedAt : Date.now(),
        } satisfies Todo;
      })
      .filter(Boolean) as Todo[];
  } catch {
    return [];
  }
}

export function saveTodos(storageKey: string, todos: Todo[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(todos));
}

export function sortTodos(todos: Todo[]): Todo[] {
  // Active first, then by updatedAt desc.
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.updatedAt - a.updatedAt;
  });
}
