import { create } from 'zustand';

interface ModalStore {
  isConfigModalOpen: boolean;
  openConfigModal: () => void;
  closeConfigModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isConfigModalOpen: false,
  openConfigModal: () => set({ isConfigModalOpen: true }),
  closeConfigModal: () => set({ isConfigModalOpen: false }),
}));
