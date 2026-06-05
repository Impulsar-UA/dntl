import { api } from './client';
import type {
  CreatePetitionRequest,
  Petition,
  UpdatePetitionRequest,
} from '@/types';

export const petitionsApi = {
  getAll: () => api.get<Petition[]>('/petitions'),

  getById: (id: string) => api.get<Petition>(`/petitions/${id}`),

  create: (payload: CreatePetitionRequest) =>
    api.post<Petition>('/petitions', payload),

  update: (id: string, payload: UpdatePetitionRequest) =>
    api.put<Petition>(`/petitions/${id}`, payload),

  remove: (id: string) => api.delete<void>(`/petitions/${id}`),

  vote: (id: string, donorId: string) =>
    api.post<{ message: string }>(`/petitions/${id}/vote`, { donorId }),
};
