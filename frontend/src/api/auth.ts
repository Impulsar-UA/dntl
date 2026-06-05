import { api } from './client';
import type {
  LoginRequest,
  RegisterDonorRequest,
  RegisterOrgRepRequest,
  User,
} from '@/types';

export const authApi = {
  login: (payload: LoginRequest) => api.post<User>('/users/login', payload),

  registerDonor: (payload: RegisterDonorRequest) =>
    api.post<User>('/users/register/donor', payload),

  registerOrgRep: (payload: RegisterOrgRepRequest) =>
    api.post<User>('/users/register/org-representative', payload),

  /** Exchange a Google ID token (from GIS) for a Donatly user session. */
  loginWithGoogle: (idToken: string) =>
    api.post<User>('/users/google', { idToken }),

  // --- Admin user management ---
  listUsers: () => api.get<User[]>('/users'),

  setUserActive: (id: string, isActive: boolean) =>
    api.put<User>(`/users/${id}/active`, { isActive }),
};
