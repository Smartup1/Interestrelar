// src/hooks/useAuth.tsx
import { useEffect, useSyncExternalStore } from "react";

import {
  getUser,
  loadUser,
  subscribeUser,
  updateName,
  signOut,
  signInWithProviderToken,
  isProviderConfigured,
} from "../services/auth";

/**
 * Perfil do jogador atual.
 * `user` é null só por um instante, enquanto carrega do aparelho.
 */
export function useAuth() {
  const user = useSyncExternalStore(subscribeUser, getUser, getUser);

  useEffect(() => {
    void loadUser();
  }, []);

  return {
    user,
    isGuest: !user || user.provider === "guest",
    updateName,
    signOut,
    signInWithProviderToken,
    isProviderConfigured,
  };
}
