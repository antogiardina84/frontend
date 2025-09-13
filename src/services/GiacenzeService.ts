// frontend/src/services/GiacenzeService.ts
import api from './api';
import { 
  Giacenza,
  GiacenzaCalcolata
} from '../types';

export class GiacenzeService {
  
  static async getGiacenze(dataRiferimento: string): Promise<{ giacenze: GiacenzaCalcolata[] }> {
    const response = await api.get(`/giacenze?dataRiferimento=${dataRiferimento}`);
    return response.data;
  }
  
  static async aggiornaGiacenze(dataRiferimento: string): Promise<{ giacenze: GiacenzaCalcolata[] }> {
    const response = await api.post('/giacenze/aggiorna', { dataRiferimento });
    return response.data;
  }
  
  static async getStoricoGiacenze(
    tipologiaId?: number,
    dataInizio?: string,
    dataFine?: string
  ): Promise<{ data: Giacenza[] }> {
    const params = new URLSearchParams();
    if (tipologiaId) params.append('tipologiaId', tipologiaId.toString());
    if (dataInizio) params.append('dataInizio', dataInizio);
    if (dataFine) params.append('dataFine', dataFine);
    
    const response = await api.get(`/giacenze/storico?${params.toString()}`);
    return response.data;
  }
}