import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

const DAILY_LIMIT = 50;
const STORAGE_KEY = 'interestelar_daily_credits';

interface DailyCreditsData {
  date: string;
  used: number;
  total: number;
}

interface UseDailyCreditsReturn {
  creditsLeft: number;
  totalCredits: number;
  canPlay: boolean;
  loading: boolean;
  useCredit: () => Promise<boolean>;
  addCredit: () => Promise<void>;
  resetInfo: string;
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getResetInfo(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diffMs = tomorrow.getTime() - now.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor((diffMs % 3600000) / 60000);
  if (diffH > 0) return `Renova em ${diffH}h ${diffM}min`;
  return `Renova em ${diffM} minutos`;
}

// No navegador, usa localStorage. No celular, usa AsyncStorage.
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.setItem(key, value);
  },
};

export function useDailyCredits(): UseDailyCreditsReturn {
  const [data, setData] = useState<DailyCreditsData>({
    date: getTodayString(),
    used: 0,
    total: DAILY_LIMIT,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await storage.getItem(STORAGE_KEY);
        const today = getTodayString();
        if (raw) {
          const parsed: DailyCreditsData = JSON.parse(raw);
          if (parsed.date === today) {
            setData(parsed);
          } else {
            const fresh = { date: today, used: 0, total: DAILY_LIMIT };
            await storage.setItem(STORAGE_KEY, JSON.stringify(fresh));
            setData(fresh);
          }
        } else {
          const fresh = { date: today, used: 0, total: DAILY_LIMIT };
          await storage.setItem(STORAGE_KEY, JSON.stringify(fresh));
          setData(fresh);
        }
      } catch (e) {
        setData({ date: getTodayString(), used: 0, total: DAILY_LIMIT });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const useCredit = useCallback(async (): Promise<boolean> => {
    const today = getTodayString();
    const current = data.date === today ? data : { date: today, used: 0, total: DAILY_LIMIT };
    if (current.used >= current.total) return false;
    const updated = { ...current, used: current.used + 1 };
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
    setData(updated);
    return true;
  }, [data]);

  const addCredit = useCallback(async (): Promise<void> => {
    const today = getTodayString();
    const current = data.date === today ? data : { date: today, used: 0, total: DAILY_LIMIT };
    if (current.used === 0) return;
    const updated = { ...current, used: current.used - 1 };
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
    setData(updated);
  }, [data]);

  const creditsLeft = Math.max(0, data.total - data.used);

  return {
    creditsLeft,
    totalCredits: data.total,
    canPlay: creditsLeft > 0,
    loading,
    useCredit,
    addCredit,
    resetInfo: creditsLeft === 0 ? getResetInfo() : '',
  };
}