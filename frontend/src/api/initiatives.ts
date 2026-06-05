import { api } from './client';
import type {
  CreateInitiativeRequest,
  Initiative,
  UpdateInitiativeRequest,
} from '@/types';

export const initiativesApi = {
  getAll: () => api.get<Initiative[]>('/initiatives'),

  getActive: () => api.get<Initiative[]>('/initiatives/active'),

  getById: (id: string) => api.get<Initiative>(`/initiatives/${id}`),

  create: (payload: CreateInitiativeRequest) =>
    api.post<Initiative>('/initiatives', payload),

  update: (id: string, payload: UpdateInitiativeRequest) =>
    api.put<Initiative>(`/initiatives/${id}`, payload),

  remove: (id: string) => api.delete<void>(`/initiatives/${id}`),
};
