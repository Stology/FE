import { create } from 'zustand';

interface HomeTodoState {
  readItemIds: string[];
  markAsRead: (id: string) => void;
}

export const useHomeTodoStore = create<HomeTodoState>((set) => ({
  readItemIds: [],
  markAsRead: (id) =>
    set((state) => ({
      readItemIds: state.readItemIds.includes(id) ? state.readItemIds : [...state.readItemIds, id],
    })),
}));
