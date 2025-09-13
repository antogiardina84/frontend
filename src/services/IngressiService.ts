// frontend/src/services/IngressiService.ts
import api from './api';
import { 
  Ingresso, 
  IngressoFormData, 
  FiltriIngressi, 
  ApiResponse,
  ReportRiepilogoMensile 
} from '../types';

export class IngressiService {
  
  static async getIngressi(filtri: FiltriIngressi = {}): Promise<ApiResponse<Ingresso[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filtri).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/ingressi?${params.toString()}`);
    return response.data;
  }
  
  static async createIngresso(data: IngressoFormData): Promise<ApiResponse<Ingresso>> {
    const response = await api.post('/ingressi', data);
    return response.data;
  }
  
  static async updateIngresso(id: number, data: IngressoFormData): Promise<ApiResponse<Ingresso>> {
    const response = await api.put(`/ingressi/${id}`, data);
    return response.data;
  }
  
  static async deleteIngresso(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/ingressi/${id}`);
    return response.data;
  }
  
  static async getRiepilogo(mese: number, anno: number, comuneId?: number, tipologiaId?: number) {
    const params = new URLSearchParams({
      mese: mese.toString(),
      anno: anno.toString()
    });
    
    if (comuneId) params.append('comuneId', comuneId.toString());
    if (tipologiaId) params.append('tipologiaId', tipologiaId.toString());
    
    const response = await api.get(`/ingressi/riepilogo?${params.toString()}`);
    return response.data;
  }
}