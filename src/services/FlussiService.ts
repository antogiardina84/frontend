import api from './api';
import { FlussoCorepla, ApiResponse } from '../types';

export class FlussiService {
  
  static async getFlussi(attivo?: boolean): Promise<ApiResponse<FlussoCorepla[]>> {
    const params = new URLSearchParams();
    if (attivo !== undefined) params.append('attivo', attivo.toString());
    
    const response = await api.get(`/flussi?${params.toString()}`);
    return response.data;
  }

  static async getFlusso(id: number): Promise<ApiResponse<FlussoCorepla>> {
    const response = await api.get(`/flussi/${id}`);
    return response.data;
  }

  static async createFlusso(data: Partial<FlussoCorepla>): Promise<ApiResponse<FlussoCorepla>> {
    const response = await api.post('/flussi', data);
    return response.data;
  }

  static async updateFlusso(id: number, data: Partial<FlussoCorepla>): Promise<ApiResponse<FlussoCorepla>> {
    const response = await api.put(`/flussi/${id}`, data);
    return response.data;
  }

  static async deleteFlusso(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/flussi/${id}`);
    return response.data;
  }

  static async toggleAttivo(id: number, attivo: boolean): Promise<ApiResponse<FlussoCorepla>> {
    const response = await api.patch(`/flussi/${id}/toggle-attivo`, { attivo });
    return response.data;
  }

  static async getFlussoByCode(codice: string): Promise<ApiResponse<FlussoCorepla>> {
    const response = await api.get(`/flussi/codice/${codice}`);
    return response.data;
  }
}