// frontend/src/services/FatturazioneService.ts
import api from './api';
import { 
  Fatturazione, 
  FiltriFatturazione, 
  ApiResponse,
  CONSORZI
} from '../types';

export class FatturazioneService {
  
  static async getFatture(filtri: FiltriFatturazione = {}): Promise<ApiResponse<Fatturazione[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filtri).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/fatturazione?${params.toString()}`);
    return response.data;
  }
  
  static async generaFattura(
    mese: number, 
    anno: number, 
    consorzio: typeof CONSORZI[number]
  ): Promise<ApiResponse<Fatturazione>> {
    const response = await api.post('/fatturazione/genera', {
      mese,
      anno,
      consorzio
    });
    return response.data;
  }
  
  static async aggiornaStato(
    id: number, 
    stato: 'bozza' | 'inviata' | 'pagata',
    dataInvio?: string,
    dataPagamento?: string
  ): Promise<ApiResponse<Fatturazione>> {
    const response = await api.put(`/fatturazione/${id}/stato`, {
      stato,
      data_invio: dataInvio,
      data_pagamento: dataPagamento
    });
    return response.data;
  }
}