// frontend/src/services/TipologieMaterialiService.ts
import api from './api';
import { TipologiaMateriale, ApiResponse } from '../types';

export class TipologieMaterialiService {
  
  static async getTipologie(attivo?: boolean): Promise<ApiResponse<TipologiaMateriale[]>> {
    const params = new URLSearchParams();
    if (attivo !== undefined) params.append('attivo', attivo.toString());
    
    const response = await api.get(`/tipologie-materiali?${params.toString()}`);
    return response.data;
  }
}