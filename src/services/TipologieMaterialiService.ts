import api from './api';
import { TipologiaMateriale, ApiResponse } from '../types';

export class TipologieMaterialiService {
  
  static async getTipologie(attivo?: boolean): Promise<ApiResponse<TipologiaMateriale[]>> {
    const params = new URLSearchParams();
    if (attivo !== undefined) params.append('attivo', attivo.toString());
    
    const response = await api.get(`/tipologie-materiali?${params.toString()}`);
    return response.data;
  }

  static async getTipologia(id: number): Promise<ApiResponse<TipologiaMateriale>> {
    const response = await api.get(`/tipologie-materiali/${id}`);
    return response.data;
  }

  static async createTipologia(data: Partial<TipologiaMateriale>): Promise<ApiResponse<TipologiaMateriale>> {
    const response = await api.post('/tipologie-materiali', data);
    return response.data;
  }

  static async updateTipologia(id: number, data: Partial<TipologiaMateriale>): Promise<ApiResponse<TipologiaMateriale>> {
    const response = await api.put(`/tipologie-materiali/${id}`, data);
    return response.data;
  }

  static async deleteTipologia(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/tipologie-materiali/${id}`);
    return response.data;
  }

  static async toggleAttivo(id: number, attivo: boolean): Promise<ApiResponse<TipologiaMateriale>> {
    const response = await api.patch(`/tipologie-materiali/${id}/toggle-attivo`, { attivo });
    return response.data;
  }
}
