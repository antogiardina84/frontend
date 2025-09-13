// frontend/src/services/ComuniService.ts
import api from './api';
import { Comune, ApiResponse } from '../types';

export class ComuniService {
  
  static async getComuni(search?: string, delegaAttiva?: boolean): Promise<ApiResponse<Comune[]>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (delegaAttiva !== undefined) params.append('delegaAttiva', delegaAttiva.toString());
    
    const response = await api.get(`/comuni?${params.toString()}`);
    return response.data;
  }
  
  static async createComune(data: Omit<Comune, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Comune>> {
    const response = await api.post('/comuni', data);
    return response.data;
  }
}