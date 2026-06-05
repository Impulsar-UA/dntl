import { api } from './client';
import type { AiRecommendRequest, AiRecommendResponse } from '@/types';

export const aiApi = {
  recommend: (payload: AiRecommendRequest) =>
    api.post<AiRecommendResponse>('/ai/recommend', payload),
};
