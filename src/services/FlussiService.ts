// frontend/src/services/FlussiService.ts
import api from './api';
import { FlussoCorepla, ApiResponse } from '../types';

export class FlussiService {
  
  static async getFlussi(attivo?: boolean): Promise<ApiResponse<FlussoCorepla[]>> {
    const params = new URLSearchParams();
    if (attivo !== undefined) params.append('attivo', attivo.toString());
    
    const response = await api.get(`/flussi?${params.toString()}`);
    return response.data;
  }
}