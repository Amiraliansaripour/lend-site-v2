import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { createSelectorHooks } from 'auto-zustand-selectors-hook';

import { abilities } from '@/providers/auth/abilities';

// * types
import type { User } from '@/types/auth';
import type { MongoAbility } from '@casl/ability';

export type Theme = 'dark' | 'light' | 'system';

export type AppState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: User | null;
  setUser: (user: User) => void;
  ability: MongoAbility;
  setAbility: (ability: MongoAbility) => void;
};

type SessionState = {};

/**
 * make sure to change this inside `index.html` as well
 */
export const STORE_KEY = 'zustand-persist';

const appStoreBase = create<AppState>()(
  devtools(
    persist(
      set => ({
        theme: 'system',
        setTheme: theme => set({ theme }),
        ability: abilities.any,
        setAbility: ability => set({ ability }),
        user: null,
        setUser: user => set({ user }),
      }),
      {
        name: STORE_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: state => ({
          theme: state.theme,
        }),
      },
    ),
  ),
);

export const sessionStoreBase = create<SessionState>()(
  devtools(
    persist(set => ({}), {
      name: STORE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({}),
    }),
  ),
);

export const appStore = createSelectorHooks(appStoreBase);

export const sessionStore = createSelectorHooks(sessionStoreBase);

export type AppStore = typeof appStore;

export type SessionStore = typeof sessionStore;
