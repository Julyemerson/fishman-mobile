import { create } from 'zustand';

import api from '@/services/api';
import { IFarm } from '@/types/farm';

interface FarmStore {
  farm: IFarm;
  isLoading: boolean;
  error: string | null;
  fetchFarm: (farmId: number) => Promise<IFarm>;
}

export const useFarmStore = create<FarmStore>((set, get) => ({
  farm: {
    city: '',
    id: 0,
    name: '',
    neighborhood: '',
    number: '',
    ownerName: '',
    state: '',
    street: '',
    userId: 0,
    zipCode: '',
  },
  isLoading: false,
  error: null,

  fetchFarm: async (farmId: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get<IFarm>(`/farms/${farmId}`);
      set({ farm: response.data });
    } catch (error: any) {
      console.error('Erro ao buscar fazendas:', error.response?.data || error.message);
      set({ error: error.response?.data || 'Falha ao carregar fazendas' });
    } finally {
      set({ isLoading: false });
    }

    return get().farm;
  },
}));
