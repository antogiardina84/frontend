// frontend/src/services/UsciteService.ts - COMPLETO CORRETTO
import api from './api';
import { 
  Uscita, 
  UscitaFormData, 
  FiltriUscite, 
  ApiResponse 
} from '../types';

export class UsciteService {
  
  static async getUscite(filtri: FiltriUscite = {}): Promise<ApiResponse<Uscita[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filtri).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/uscite?${params.toString()}`);
    return response.data;
  }
  
  static async createUscita(data: UscitaFormData): Promise<ApiResponse<Uscita>> {
    const response = await api.post('/uscite', data);
    return response.data;
  }

  static async updateUscita(id: number, data: UscitaFormData): Promise<ApiResponse<Uscita>> {
    const response = await api.put(`/uscite/${id}`, data);
    return response.data;
  }

  static async deleteUscita(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/uscite/${id}`);
    return response.data;
  }

  static async getUscita(id: number): Promise<ApiResponse<Uscita>> {
    const response = await api.get(`/uscite/${id}`);
    return response.data;
  }
}