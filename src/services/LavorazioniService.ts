// frontend/src/services/LavorazioniService.ts - COMPLETO CORRETTO
import api from './api';
import { 
  Lavorazione, 
  LavorazioneFormData, 
  FiltriLavorazioni, 
  ApiResponse 
} from '../types';

export class LavorazioniService {
  
  static async getLavorazioni(filtri: FiltriLavorazioni = {}): Promise<ApiResponse<Lavorazione[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filtri).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/lavorazioni?${params.toString()}`);
    return response.data;
  }
  
  static async createLavorazione(data: LavorazioneFormData): Promise<ApiResponse<Lavorazione>> {
    const response = await api.post('/lavorazioni', data);
    return response.data;
  }

  static async updateLavorazione(id: number, data: LavorazioneFormData): Promise<ApiResponse<Lavorazione>> {
    const response = await api.put(`/lavorazioni/${id}`, data);
    return response.data;
  }

  static async deleteLavorazione(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/lavorazioni/${id}`);
    return response.data;
  }

  static async getLavorazione(id: number): Promise<ApiResponse<Lavorazione>> {
    const response = await api.get(`/lavorazioni/${id}`);
    return response.data;
  }
}