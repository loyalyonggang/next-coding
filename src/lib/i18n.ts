export type Locale = "zh" | "en";

export const translations = {
  zh: {
    title: "待办清单",
    subtitle: "本地保存（LocalStorage），轻量、干净、现代。",
    active: "进行中",
    done: "已完成",
    all: "全部",
    completed: "已完成",
    clearCompleted: "清空已完成",
    addPlaceholder: "添加一个任务…（回车创建）",
    addButton: "新增",
    edit: "编辑",
    delete: "删除",
    save: "保存",
    cancel: "取消",
    markComplete: "标记为已完成",
    markIncomplete: "标记为未完成",
    emptyAll: "还没有任务，先加一个吧。",
    emptyActive: "当前没有进行中的任务。",
    emptyCompleted: "还没有完成的任务。",
    tip: "提示：单击任务切换完成；双击任务文本进入编辑；编辑时 Enter 保存、Esc 取消。",
    total: "总计",
    light: "浅色",
    dark: "深色",
  },
  en: {
    title: "Todo List",
    subtitle: "Local storage, lightweight, clean, modern.",
    active: "Active",
    done: "Done",
    all: "All",
    completed: "Completed",
    clearCompleted: "Clear completed",
    addPlaceholder: "Add a task... (press Enter)",
    addButton: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    markComplete: "Mark as completed",
    markIncomplete: "Mark as incomplete",
    emptyAll: "No tasks yet. Add one!",
    emptyActive: "No active tasks.",
    emptyCompleted: "No completed tasks.",
    tip: "Tip: Click task to toggle; double-click text to edit; Enter to save, Esc to cancel.",
    total: "Total",
    light: "Light",
    dark: "Dark",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["zh"];

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}

const LOCALE_STORAGE_KEY = "next-coding.locale.v1";

export function loadLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved === "en" || saved === "zh") return saved;
  return "zh";
}

export function saveLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}
