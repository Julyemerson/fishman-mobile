import { isAxiosError } from 'axios';
import { create } from 'zustand';

import api from '@/services/api';
import { IFeeder, IFeedingLog } from '@/types/feeder';
import IPond from '@/types/pond';

export interface PondWithFeeders {
  pond: IPond;
  feeders: IFeeder[];
}

/** Por que a fazenda não carregou — cada caso tem uma mensagem diferente na tela. */
export type LoadError = 'offline' | 'server' | 'no-farm';

interface FeederStore {
  ponds: PondWithFeeders[];
  /** Todos os alimentadores da fazenda, em ordem de viveiro. */
  feeders: IFeeder[];
  /** Doses de hoje por alimentador. Ausente = não foi possível carregar. */
  logsByFeeder: Record<string, IFeedingLog[]>;
  /** Primeira carga (mostra esqueleto). Atualizações silenciosas não mexem nisso. */
  isLoading: boolean;
  isRefreshing: boolean;
  error: LoadError | null;
  lastUpdated: number | null;

  /**
   * Carrega viveiros → alimentadores → doses de hoje.
   * `silent`: atualização em segundo plano (automática), sem esqueleto e sem
   * apagar os dados da tela se falhar.
   */
  loadFarm: (
    farmId: number | null,
    options?: { silent?: boolean; pull?: boolean }
  ) => Promise<void>;
  /** Atualiza um alimentador na memória depois de salvar, sem esperar a próxima carga. */
  patchFeeder: (id: string, changes: Partial<IFeeder>) => void;
}

function classify(error: unknown): LoadError {
  if (isAxiosError(error) && !error.response) return 'offline';
  return 'server';
}

let inFlight: Promise<void> | null = null;

export const useFeederStore = create<FeederStore>((set, get) => ({
  ponds: [],
  feeders: [],
  logsByFeeder: {},
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastUpdated: null,

  loadFarm: async (farmId, { silent = false, pull = false } = {}) => {
    if (farmId === null) {
      set({ error: 'no-farm', isLoading: false, isRefreshing: false });
      return;
    }

    // Uma carga por vez: a automática não atropela a manual (e vice-versa).
    if (inFlight) return inFlight;

    const firstLoad = get().lastUpdated === null;
    set({
      isLoading: firstLoad && !silent,
      isRefreshing: pull,
      ...(silent ? {} : { error: null }),
    });

    inFlight = (async () => {
      try {
        const { data: pondList } = await api.get<IPond[]>(`/ponds/farm/${farmId}`);
        const ponds = await Promise.all(
          (Array.isArray(pondList) ? pondList : []).map(async (pond) => {
            const { data } = await api.get<IFeeder[]>(`/feeders/pond/${pond.id}`);
            return { pond, feeders: Array.isArray(data) ? data : [] };
          })
        );
        const feeders = ponds.flatMap((p) => p.feeders);

        // Doses de hoje: falha de um alimentador não derruba a tela inteira.
        const logEntries = await Promise.all(
          feeders.map(async (feeder) => {
            try {
              const { data } = await api.get<IFeedingLog[]>(`/feeders/logs/${feeder.id}`);
              return [feeder.id, Array.isArray(data) ? data : []] as const;
            } catch {
              return null;
            }
          })
        );
        const logsByFeeder = Object.fromEntries(
          logEntries.filter((e): e is readonly [string, IFeedingLog[]] => e !== null)
        );

        set({ ponds, feeders, logsByFeeder, error: null, lastUpdated: Date.now() });
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          console.error('Erro ao carregar a fazenda:', error.response?.data || error.message);
        }
        // Atualização silenciosa com dados na tela: mantém o que já estava.
        if (!(silent && get().lastUpdated !== null)) {
          set({ error: classify(error) });
        }
      } finally {
        set({ isLoading: false, isRefreshing: false });
        inFlight = null;
      }
    })();

    return inFlight;
  },

  patchFeeder: (id, changes) => {
    const apply = (f: IFeeder) => (f.id === id ? { ...f, ...changes } : f);
    set((state) => ({
      feeders: state.feeders.map(apply),
      ponds: state.ponds.map((p) => ({ ...p, feeders: p.feeders.map(apply) })),
    }));
  },
}));
