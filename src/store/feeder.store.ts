import { create } from 'zustand';

import api from '@/services/api';
import { IFeeder } from '@/types/feeder';

interface FeederStore {
  feeder: IFeeder[];
  isLoading: boolean;
  error: string | null;
  fetchFeeder: (pondId: number) => Promise<IFeeder[]>;
}

export const useFeederStore = create<FeederStore>((set, get) => ({
  feeder: [],
  isLoading: false,
  error: null,
  fetchFeeder: async (pondId: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get<IFeeder[]>(`/feeders/pond/${pondId}`);
      set({ feeder: response.data });
    } catch (err: any) {
      set({ error: err.message || 'An error occurred while fetching feeders' });
    } finally {
      set({ isLoading: false });
    }

    return get().feeder;
  },
}));
