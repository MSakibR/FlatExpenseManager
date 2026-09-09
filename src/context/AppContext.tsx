import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { AppSettings, Member, MonthlyExpense } from "../models/types";

import {
  getAllMonths,
  getMembers,
  getSettings,
  saveSettings,
} from "../utils/storage";

interface AppContextType {
  members: Member[];

  settings: AppSettings;

  months: MonthlyExpense[];

  refreshMembers: () => void;

  refreshMonths: () => void;

  refreshSettings: () => void;

  updateSettings: (settings: AppSettings) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);

  const [settings, setSettings] = useState<AppSettings>(getSettings());

  const [months, setMonths] = useState<MonthlyExpense[]>([]);

  function refreshMembers() {
    setMembers(getMembers());
  }

  function refreshMonths() {
    setMonths(getAllMonths());
  }

  function refreshSettings() {
    setSettings(getSettings());
  }

  function updateSettings(newSettings: AppSettings) {
    saveSettings(newSettings);

    setSettings(newSettings);
  }

  useEffect(() => {
    refreshMembers();
    refreshMonths();
    refreshSettings();
  }, []);

  return (
    <AppContext.Provider
      value={{
        members,
        settings,
        months,
        refreshMembers,
        refreshMonths,
        refreshSettings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
}
