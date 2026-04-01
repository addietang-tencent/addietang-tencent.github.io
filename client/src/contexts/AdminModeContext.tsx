/**
 * AdminModeContext - 管控端模式状态管理
 * 支持「标准模式」和「自定义模式」两种模式
 * 默认为标准模式，状态持久化到 localStorage
 */
import { createContext, useContext, useState, ReactNode } from "react";

export type AdminMode = "standard" | "custom";

interface AdminModeContextValue {
  mode: AdminMode;
  setMode: (mode: AdminMode) => void;
  isStandard: boolean;
  isCustom: boolean;
  hasOneid: boolean;
}

const AdminModeContext = createContext<AdminModeContextValue | null>(null);

const STORAGE_KEY = "openclaw_admin_mode";

export function AdminModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AdminMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved === "custom" ? "custom" : "standard") as AdminMode;
  });

  const setMode = (newMode: AdminMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  };

  return (
    <AdminModeContext.Provider
      value={{
        mode,
        setMode,
        isStandard: mode === "standard",
        isCustom: mode === "custom",
        hasOneid: mode === "standard",
      }}
    >
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  const ctx = useContext(AdminModeContext);
  if (!ctx) throw new Error("useAdminMode must be used within AdminModeProvider");
  return ctx;
}
