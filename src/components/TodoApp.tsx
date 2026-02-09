"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  clampTitle,
  loadTodos,
  saveTodos,
  sortTodos,
  Todo,
  TodoFilter,
  uid,
} from "@/lib/todos";
import { Locale, loadLocale, saveLocale, t } from "@/lib/i18n";
import { Theme, loadTheme, saveTheme, applyTheme } from "@/lib/theme";

const STORAGE_KEY = "next-coding.todos.v1";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function PillButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-full px-3 py-1.5 text-sm font-medium transition",
        active
          ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-900",
      )}
    >
      {children}
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function LanguageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [locale, setLocaleState] = useState<Locale>("zh");
  const [theme, setThemeState] = useState<Theme>("light");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const initial = sortTodos(loadTodos(STORAGE_KEY));
    setTodos(initial);
    const savedLocale = loadLocale();
    setLocaleState(savedLocale);
    const savedTheme = loadTheme();
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  useEffect(() => {
    saveTodos(STORAGE_KEY, todos);
  }, [todos]);

  function setLocale(newLocale: Locale) {
    setLocaleState(newLocale);
    saveLocale(newLocale);
  }

  function setTheme(newTheme: Theme) {
    setThemeState(newTheme);
    saveTheme(newTheme);
    applyTheme(newTheme);
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function toggleLocale() {
    setLocale(locale === "zh" ? "en" : "zh");
  }

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((item) => item.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }, [todos]);

  const visible = useMemo(() => {
    const list = sortTodos(todos);
    if (filter === "active") return list.filter((item) => !item.completed);
    if (filter === "completed") return list.filter((item) => item.completed);
    return list;
  }, [todos, filter]);

  function addTodo() {
    const title = clampTitle(draft);
    if (!title) return;
    const now = Date.now();
    const next: Todo = {
      id: uid(),
      title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    setTodos((prev) => sortTodos([next, ...prev]));
    setDraft("");
    inputRef.current?.focus();
  }

  function toggleTodo(id: string) {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    setTodos((prev) =>
      sortTodos(
        prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed, updatedAt: now } : item,
        ),
      ),
    );
  }

  function removeTodo(id: string) {
    setTodos((prev) => prev.filter((item) => item.id !== id));
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  function commitEdit(id: string) {
    const title = clampTitle(editingTitle);
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    if (!title) {
      removeTodo(id);
      cancelEdit();
      return;
    }
    setTodos((prev) =>
      sortTodos(prev.map((item) => (item.id === id ? { ...item, title, updatedAt: now } : item))),
    );
    cancelEdit();
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((item) => !item.completed));
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{t(locale, "title")}</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {t(locale, "subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="grid size-10 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                title={theme === "dark" ? t(locale, "light") : t(locale, "dark")}
              >
                {theme === "dark" ? (
                  <SunIcon className="size-5" />
                ) : (
                  <MoonIcon className="size-5" />
                )}
              </button>
              {/* Locale Toggle */}
              <button
                type="button"
                onClick={toggleLocale}
                className="flex h-10 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                title={locale === "zh" ? "English" : "中文"}
              >
                <LanguageIcon className="size-4" />
                <span>{locale === "zh" ? "EN" : "中"}</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-3">
              <span className="text-zinc-600 dark:text-zinc-400">{t(locale, "active")}</span>
              <span className="font-semibold tabular-nums">{stats.active}</span>
              <span className="text-zinc-400">·</span>
              <span className="text-zinc-600 dark:text-zinc-400">{t(locale, "done")}</span>
              <span className="font-semibold tabular-nums">{stats.completed}</span>
            </div>
          </div>
        </header>

        <main className="rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTodo();
                  }}
                  placeholder={t(locale, "addPlaceholder")}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-black/40 dark:ring-zinc-100/10 dark:placeholder:text-zinc-500"
                />
              </div>
              <button
                type="button"
                onClick={addTodo}
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:translate-y-px dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {t(locale, "addButton")}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <PillButton active={filter === "all"} onClick={() => setFilter("all")}>
                  {t(locale, "all")}
                </PillButton>
                <PillButton active={filter === "active"} onClick={() => setFilter("active")}>
                  {t(locale, "active")}
                </PillButton>
                <PillButton
                  active={filter === "completed"}
                  onClick={() => setFilter("completed")}
                >
                  {t(locale, "completed")}
                </PillButton>
              </div>

              <button
                type="button"
                onClick={clearCompleted}
                disabled={stats.completed === 0}
                className={cx(
                  "text-sm font-medium transition",
                  stats.completed === 0
                    ? "cursor-not-allowed text-zinc-400"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white",
                )}
              >
                {t(locale, "clearCompleted")}
              </button>
            </div>
          </div>

          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {visible.length === 0 ? (
              <li className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {filter === "completed"
                  ? t(locale, "emptyCompleted")
                  : filter === "active"
                    ? t(locale, "emptyActive")
                    : t(locale, "emptyAll")}
              </li>
            ) : (
              visible.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <li key={item.id} className="p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleTodo(item.id)}
                        className={cx(
                          "mt-0.5 grid size-6 place-items-center rounded-lg border transition",
                          item.completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900",
                        )}
                        aria-label={
                          item.completed ? t(locale, "markIncomplete") : t(locale, "markComplete")
                        }
                      >
                        {item.completed ? (
                          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                            <path
                              fillRule="evenodd"
                              d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.5a1 1 0 0 1-1.414 0l-3.5-3.5A1 1 0 1 1 5.71 9.29l2.792 2.793 6.793-6.793a1 1 0 0 1 1.409 0Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : null}
                      </button>

                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <input
                              autoFocus
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitEdit(item.id);
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-800 dark:bg-black/40 dark:ring-zinc-100/10"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => commitEdit(item.id)}
                                className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                              >
                                {t(locale, "save")}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                              >
                                {t(locale, "cancel")}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <button
                              type="button"
                              onDoubleClick={() => startEdit(item)}
                              onClick={() => toggleTodo(item.id)}
                              className={cx(
                                "text-left text-sm font-medium leading-6 transition",
                                item.completed
                                  ? "text-zinc-400 line-through dark:text-zinc-500"
                                  : "text-zinc-900 dark:text-zinc-50",
                              )}
                              title={
                                locale === "zh"
                                  ? "单击切换完成；双击编辑"
                                  : "Click to toggle; double-click to edit"
                              }
                            >
                              {item.title}
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                              >
                                {t(locale, "edit")}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeTodo(item.id)}
                                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                              >
                                {t(locale, "delete")}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="mt-1 text-xs text-zinc-400">
                          {new Date(item.updatedAt).toLocaleString(
                            locale === "zh" ? "zh-CN" : "en-US",
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          <footer className="flex flex-col gap-2 border-t border-zinc-200 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
            <div>{t(locale, "tip")}</div>
            <div className="tabular-nums">
              {t(locale, "total")} {stats.total} · {t(locale, "active")} {stats.active} ·{" "}
              {t(locale, "done")} {stats.completed}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
