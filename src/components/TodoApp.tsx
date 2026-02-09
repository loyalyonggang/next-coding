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

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const initial = sortTodos(loadTodos(STORAGE_KEY));
    setTodos(initial);
  }, []);

  useEffect(() => {
    saveTodos(STORAGE_KEY, todos);
  }, [todos]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }, [todos]);

  const visible = useMemo(() => {
    const list = sortTodos(todos);
    if (filter === "active") return list.filter((t) => !t.completed);
    if (filter === "completed") return list.filter((t) => t.completed);
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
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed, updatedAt: now } : t)),
      ),
    );
  }

  function removeTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
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
      // Empty title means delete.
      removeTodo(id);
      cancelEdit();
      return;
    }
    setTodos((prev) =>
      sortTodos(prev.map((t) => (t.id === id ? { ...t, title, updatedAt: now } : t))),
    );
    cancelEdit();
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Todo List</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                本地保存（LocalStorage），轻量、干净、现代。
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center gap-3">
                <span className="text-zinc-600 dark:text-zinc-400">Active</span>
                <span className="font-semibold tabular-nums">{stats.active}</span>
                <span className="text-zinc-400">·</span>
                <span className="text-zinc-600 dark:text-zinc-400">Done</span>
                <span className="font-semibold tabular-nums">{stats.completed}</span>
              </div>
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
                  placeholder="添加一个任务…（回车创建）"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-4 dark:border-zinc-800 dark:bg-black/40 dark:ring-zinc-100/10 dark:placeholder:text-zinc-500"
                />
              </div>
              <button
                type="button"
                onClick={addTodo}
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:translate-y-px dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                新增
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <PillButton active={filter === "all"} onClick={() => setFilter("all")}>
                  全部
                </PillButton>
                <PillButton active={filter === "active"} onClick={() => setFilter("active")}>
                  进行中
                </PillButton>
                <PillButton
                  active={filter === "completed"}
                  onClick={() => setFilter("completed")}
                >
                  已完成
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
                清空已完成
              </button>
            </div>
          </div>

          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {visible.length === 0 ? (
              <li className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {filter === "completed"
                  ? "还没有完成的任务。"
                  : filter === "active"
                    ? "当前没有进行中的任务。"
                    : "还没有任务，先加一个吧。"}
              </li>
            ) : (
              visible.map((t) => {
                const isEditing = editingId === t.id;
                return (
                  <li key={t.id} className="p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleTodo(t.id)}
                        className={cx(
                          "mt-0.5 grid size-6 place-items-center rounded-lg border transition",
                          t.completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900",
                        )}
                        aria-label={t.completed ? "标记为未完成" : "标记为已完成"}
                      >
                        {t.completed ? (
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
                                if (e.key === "Enter") commitEdit(t.id);
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-800 dark:bg-black/40 dark:ring-zinc-100/10"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => commitEdit(t.id)}
                                className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                              >
                                保存
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <button
                              type="button"
                              onDoubleClick={() => startEdit(t)}
                              onClick={() => toggleTodo(t.id)}
                              className={cx(
                                "text-left text-sm font-medium leading-6 transition",
                                t.completed
                                  ? "text-zinc-400 line-through dark:text-zinc-500"
                                  : "text-zinc-900 dark:text-zinc-50",
                              )}
                              title="单击切换完成；双击编辑"
                            >
                              {t.title}
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(t)}
                                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                onClick={() => removeTodo(t.id)}
                                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                              >
                                删除
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="mt-1 text-xs text-zinc-400">
                          {new Date(t.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          <footer className="flex flex-col gap-2 border-t border-zinc-200 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
            <div>
              提示：单击任务切换完成；双击任务文本进入编辑；编辑时 Enter 保存、Esc 取消。
            </div>
            <div className="tabular-nums">
              总计 {stats.total} · 进行中 {stats.active} · 已完成 {stats.completed}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
