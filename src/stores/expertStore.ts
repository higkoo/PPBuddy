import { create } from 'zustand';
import { ExpertMode } from '../types';
import { expertApi } from '../api/expert';

interface ExpertStore {
  experts: ExpertMode[];
  selectedExpert: ExpertMode | null;
  isLoading: boolean;
  error: string | null;
  
  loadExperts: () => Promise<void>;
  selectExpert: (expert: ExpertMode | null) => void;
  createExpert: (data: { name: string; description: string; systemPrompt: string }) => Promise<void>;
  updateExpert: (id: string, data: Partial<ExpertMode>) => Promise<void>;
  deleteExpert: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useExpertStore = create<ExpertStore>((set) => ({
  experts: [],
  selectedExpert: null,
  isLoading: false,
  error: null,

  loadExperts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await expertApi.getExperts();
      if (response.success && response.data) {
        set({ experts: response.data as ExpertMode[], isLoading: false });
      } else {
        set({ error: response.error || 'Failed to load experts', isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to load experts', 
        isLoading: false 
      });
    }
  },

  selectExpert: (expert: ExpertMode | null) => {
    set({ selectedExpert: expert });
  },

  createExpert: async (data: { name: string; description: string; systemPrompt: string }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await expertApi.createExpert(data);
      if (response.success && response.data) {
        set((state) => ({
          experts: [...state.experts, response.data as ExpertMode],
          isLoading: false,
        }));
      } else {
        set({ error: response.error || 'Failed to create expert', isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to create expert', 
        isLoading: false 
      });
    }
  },

  updateExpert: async (id: string, data: Partial<ExpertMode>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await expertApi.updateExpert(id, data);
      if (response.success && response.data) {
        set((state) => ({
          experts: state.experts.map((e) => (e.id === id ? response.data as ExpertMode : e)),
          isLoading: false,
        }));
      } else {
        set({ error: response.error || 'Failed to update expert', isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to update expert', 
        isLoading: false 
      });
    }
  },

  deleteExpert: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await expertApi.deleteExpert(id);
      if (response.success) {
        set((state) => ({
          experts: state.experts.filter((e) => e.id !== id),
          selectedExpert: state.selectedExpert?.id === id ? null : state.selectedExpert,
          isLoading: false,
        }));
      } else {
        set({ error: response.error || 'Failed to delete expert', isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to delete expert', 
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));
