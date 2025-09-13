// frontend/src/services/CostiService.ts - COMPLETO CORRETTO
import api from './api';
import { 
  Costo, 
  CostoFormData, 
  FiltriBase, 
  ApiResponse 
} from '../types';

interface FiltriCosti extends FiltriBase {
  categoria?: string;
  tipologiaId?: number;
}

export class CostiService {
  
  static async getCosti(filtri: FiltriCosti = {}): Promise<ApiResponse<Costo[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filtri).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/costi?${params.toString()}`);
    return response.data;
  }
  
  static async createCosto(data: CostoFormData): Promise<ApiResponse<Costo>> {
    const response = await api.post('/costi', data);
    return response.data;
  }

  static async updateCosto(id: number, data: CostoFormData): Promise<ApiResponse<Costo>> {
    const response = await api.put(`/costi/${id}`, data);
    return response.data;
  }

  static async deleteCosto(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/costi/${id}`);
    return response.data;
  }
  
  static async getRiepilogoCosti(mese: number, anno: number, categoria?: string) {
    const params = new URLSearchParams({
      mese: mese.toString(),
      anno: anno.toString()
    });
    
    if (categoria) params.append('categoria', categoria);
    
    const response = await api.get(`/costi/riepilogo?${params.toString()}`);
    return response.data;
  }
}