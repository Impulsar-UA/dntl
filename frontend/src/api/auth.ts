import { api } from './client';
import type {
  LoginRequest,
  RegisterAdminRequest,
  RegisterOrgRepRequest,
  User,
} from '@/types';

export const authApi = {
  login: (payload: LoginRequest) => api.post<User>('/users/login', payload),

  registerOrgRep: (payload: RegisterOrgRepRequest) =>
    api.post<User>('/users/register/org-representative', payload),

  registerAdmin: (payload: RegisterAdminRequest) =>
    api.post<User>('/users/register/admin', payload),
};
