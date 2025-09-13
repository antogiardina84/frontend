// frontend/src/services/ReportService.ts - CORRETTO
import api from './api';
import { ReportRiepilogoMensile, AndamentoRaccolta, MovimentoMagazzino } from '../types';

export class ReportService {
  
  static async getRiepilogoMensile(mese: number, anno: number): Promise<ReportRiepilogoMensile> {
    const response = await api.get(`/report/riepilogo-mensile?mese=${mese}&anno=${anno}`);
    return response.data;
  }
  
  static async getAndamentoRaccolta(annoInizio: number, annoFine: number): Promise<AndamentoRaccolta> {
    const response = await api.get(`/report/andamento-raccolta?annoInizio=${annoInizio}&annoFine=${annoFine}`);
    return response.data;
  }
  
  static async getMovimentiMagazzino(dataInizio: string, dataFine: string, tipologiaId?: number): Promise<{ movimenti: MovimentoMagazzino[] }> {
    const params = new URLSearchParams({
      dataInizio,
      dataFine
    });
    
    if (tipologiaId) params.append('tipologiaId', tipologiaId.toString());
    
    const response = await api.get(`/report/movimenti-magazzino?${params.toString()}`);
    return response.data;
  }
}