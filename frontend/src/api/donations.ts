import { api } from './client';
import type { CreateDonationRequest, Donation } from '@/types';

export const donationsApi = {
  donate: (payload: CreateDonationRequest) =>
    api.post<Donation>('/donations', payload),

  historyByDonor: (donorId: string) =>
    api.get<Donation[]>(`/donations/donor/${donorId}`),
};
