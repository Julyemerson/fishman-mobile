import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id?: number;
  farmId?: string;
  name: string;
  email: string;
  /** Vem do GET /auth/me. Sessões antigas não têm até a primeira busca. */
  role?: UserRole;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  farmId: number | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (token: string, farmId: number | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      farmId: null,

      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
      },

      setUser: (user) => {
        set({ user });
      },

      login: (token, farmId) => {
        set({ token, farmId, isAuthenticated: true });
      },

      logout: () => {
        set({ token: null, user: null, farmId: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        farmId: state.farmId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token;
        }
      },
    }
  )
);

/**
 * Mostra as ferramentas de desenvolvedor. É só para esconder a tela: quem
 * protege de verdade é o backend, que recusa (403) as rotas de admin.
 */
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'ADMIN';
