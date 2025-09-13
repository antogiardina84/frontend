// frontend/src/services/ComuniService.ts
import api from './api';
import { Comune, ApiResponse } from '../types';

export class ComuniService {
  
  static async getComuni(delegaAttiva?: boolean): Promise<ApiResponse<Comune[]>> {
    const params = new URLSearchParams();
    if (delegaAttiva !== undefined) params.append('delega_attiva', delegaAttiva.toString());
    
    const response = await api.get(`/comuni?${params.toString()}`);
    return response.data;
  }

  static async getComune(id: number): Promise<ApiResponse<Comune>> {
    const response = await api.get(`/comuni/${id}`);
    return response.data;
  }

  static async createComune(data: Partial<Comune>): Promise<ApiResponse<Comune>> {
    const response = await api.post('/comuni', data);
    return response.data;
  }

  static async updateComune(id: number, data: Partial<Comune>): Promise<ApiResponse<Comune>> {
    const response = await api.put(`/comuni/${id}`, data);
    return response.data;
  }

  static async deleteComune(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/comuni/${id}`);
    return response.data;
  }

  static async toggleDelega(id: number, delegaAttiva: boolean): Promise<ApiResponse<Comune>> {
    const response = await api.patch(`/comuni/${id}/toggle-delega`, { delega_attiva: delegaAttiva });
    return response.data;
  }

  static async searchComuni(query: string): Promise<ApiResponse<Comune[]>> {
    const params = new URLSearchParams({ q: query });
    const response = await api.get(`/comuni/search?${params.toString()}`);
    return response.data;
  }

  static async getComuneByCodiceIstat(codiceIstat: string): Promise<ApiResponse<Comune>> {
    const response = await api.get(`/comuni/istat/${codiceIstat}`);
    return response.data;
  }
}