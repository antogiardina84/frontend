// frontend/src/services/AnalisiService.ts
import api from './api';
import { 
  AnalisiQualitativa, 
  AnalisiFormData, 
  FiltriAnalisi, 
  ApiResponse,
  CalcoliCorepla,
  Paginazione
} from '../types';

export class AnalisiService {
  
  /**
   * Ottiene la lista delle analisi con filtri e paginazione
   */
  static async getAnalisi(filtri: FiltriAnalisi & { page?: number; limit?: number } = {}): Promise<ApiResponse<AnalisiQualitativa[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filtri).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/analisi?${params.toString()}`);
    return response.data;
  }
  
  /**
   * Ottiene una singola analisi per ID
   */
  static async getAnalisiById(id: number): Promise<ApiResponse<AnalisiQualitativa>> {
    const response = await api.get(`/analisi/${id}`);
    return response.data;
  }
  
  /**
   * Crea una nuova analisi qualitativa
   */
  static async createAnalisi(data: AnalisiFormData): Promise<ApiResponse<AnalisiQualitativa>> {
    // Prepara i dati per l'invio al backend
    const analisiData = {
      ...data,
      // Assicura che i campi numerici siano convertiti correttamente
      comune_id: Number(data.comune_id),
      flusso_id: Number(data.flusso_id),
      perc_cpl_pet: Number(data.perc_cpl_pet),
      perc_altri_cpl: Number(data.perc_altri_cpl),
      perc_traccianti: Number(data.perc_traccianti),
      perc_cassette_cac: Number(data.perc_cassette_cac),
      perc_imballaggi_conip: Number(data.perc_imballaggi_conip),
      perc_imballaggi_vari: Number(data.perc_imballaggi_vari),
      perc_frazione_estranea: Number(data.perc_frazione_estranea),
      perc_frazione_fine: Number(data.perc_frazione_fine),
      perc_frazione_neutra: Number(data.perc_frazione_neutra),
      peso_campione_kg: data.peso_campione_kg ? Number(data.peso_campione_kg) : null,
      validata: false // Le nuove analisi non sono mai validate di default
    };
    
    const response = await api.post('/analisi', analisiData);
    return response.data;
  }
  
  /**
   * Aggiorna un'analisi esistente
   */
  static async updateAnalisi(id: number, data: Partial<AnalisiFormData>): Promise<ApiResponse<AnalisiQualitativa>> {
    // Prepara i dati per l'aggiornamento
    const analisiData: any = { ...data };
    
    // Converte i campi numerici se presenti
    if (data.comune_id !== undefined) analisiData.comune_id = Number(data.comune_id);
    if (data.flusso_id !== undefined) analisiData.flusso_id = Number(data.flusso_id);
    if (data.perc_cpl_pet !== undefined) analisiData.perc_cpl_pet = Number(data.perc_cpl_pet);
    if (data.perc_altri_cpl !== undefined) analisiData.perc_altri_cpl = Number(data.perc_altri_cpl);
    if (data.perc_traccianti !== undefined) analisiData.perc_traccianti = Number(data.perc_traccianti);
    if (data.perc_cassette_cac !== undefined) analisiData.perc_cassette_cac = Number(data.perc_cassette_cac);
    if (data.perc_imballaggi_conip !== undefined) analisiData.perc_imballaggi_conip = Number(data.perc_imballaggi_conip);
    if (data.perc_imballaggi_vari !== undefined) analisiData.perc_imballaggi_vari = Number(data.perc_imballaggi_vari);
    if (data.perc_frazione_estranea !== undefined) analisiData.perc_frazione_estranea = Number(data.perc_frazione_estranea);
    if (data.perc_frazione_fine !== undefined) analisiData.perc_frazione_fine = Number(data.perc_frazione_fine);
    if (data.perc_frazione_neutra !== undefined) analisiData.perc_frazione_neutra = Number(data.perc_frazione_neutra);
    if (data.peso_campione_kg !== undefined) {
      analisiData.peso_campione_kg = data.peso_campione_kg ? Number(data.peso_campione_kg) : null;
    }
    
    const response = await api.put(`/analisi/${id}`, analisiData);
    return response.data;
  }
  
  /**
   * Elimina un'analisi
   */
  static async deleteAnalisi(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/analisi/${id}`);
    return response.data;
  }
  
  /**
   * Valida un'analisi qualitativa
   * Questo endpoint esegue anche i calcoli di conformità secondo COREPLA
   */
  static async validaAnalisi(id: number): Promise<ApiResponse<AnalisiQualitativa & { conformita: any }>> {
    const response = await api.put(`/analisi/${id}/valida`);
    return response.data;
  }
  
  /**
   * Annulla la validazione di un'analisi
   */
  static async annullaValidazione(id: number): Promise<ApiResponse<AnalisiQualitativa>> {
    const response = await api.put(`/analisi/${id}/annulla-validazione`);
    return response.data;
  }
  
  /**
   * Ottiene i calcoli COREPLA per un'analisi
   */
  static async getCalcoli(id: number): Promise<CalcoliCorepla> {
    const response = await api.get(`/analisi/${id}/calcoli`);
    return response.data;
  }
  
  /**
   * Ottiene le statistiche delle analisi
   */
  static async getStatistiche(filtri: Partial<FiltriAnalisi> = {}): Promise<ApiResponse<{
    totaleAnalisi: number;
    analisiValidate: number;
    analisiInAttesa: number;
    percentualeConformita: number;
    mediaPercentuali: {
      cpl_pet: number;
      altri_cpl: number;
      traccianti: number;
      cassette_cac: number;
      imballaggi_conip: number;
      imballaggi_vari: number;
      frazione_estranea: number;
      frazione_fine: number;
      frazione_neutra: number;
    };
    conformitaPerFlusso: {
      flusso_id: number;
      flusso_nome: string;
      totale: number;
      conformi: number;
      percentualeConformita: number;
    }[];
  }>> {
    const params = new URLSearchParams();
    
    Object.entries(filtri).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/analisi/statistiche?${params.toString()}`);
    return response.data;
  }
  
  /**
   * Esporta le analisi in formato Excel
   */
  static async esportaExcel(filtri: FiltriAnalisi = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filtri).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/analisi/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  }
  
  /**
   * Esporta le analisi in formato CSV
   */
  static async esportaCSV(filtri: FiltriAnalisi = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filtri).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/analisi/export/csv?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  }
  
  /**
   * Calcola la media mobile quadrimestrale per un comune/flusso
   */
  static async calcolaMediaMobile(
    comuneId: number, 
    flussoId: number, 
    dataRiferimento: string
  ): Promise<ApiResponse<{
    mediaQuadrimestrale: {
      perc_cpl_pet: number;
      perc_altri_cpl: number;
      perc_traccianti: number;
      perc_cassette_cac: number;
      perc_imballaggi_conip: number;
      perc_imballaggi_vari: number;
      perc_frazione_estranea: number;
      perc_frazione_fine: number;
    };
    analisiUtilizzate: AnalisiQualitativa[];
    periodoRiferimento: {
      dataInizio: string;
      dataFine: string;
    };
  }>> {
    const response = await api.get(`/analisi/media-mobile`, {
      params: {
        comuneId,
        flussoId,
        dataRiferimento
      }
    });
    return response.data;
  }
  
  /**
   * Verifica la conformità di un'analisi secondo i parametri COREPLA
   */
  static async verificaConformita(id: number): Promise<ApiResponse<{
    conforme: boolean;
    violazioni: string[];
    dettagli: {
      limiteTraccianti: number;
      limiteFrazioneEstranea: number;
      limiteCpl: number;
      valoriRilevati: {
        traccianti: number;
        frazioneEstranea: number;
        cplTotali: number;
      };
    };
  }>> {
    const response = await api.get(`/analisi/${id}/conformita`);
    return response.data;
  }
  
  /**
   * Duplica un'analisi esistente (utile per creare nuove analisi simili)
   */
  static async duplicaAnalisi(id: number, nuovaData?: string): Promise<ApiResponse<AnalisiQualitativa>> {
    const response = await api.post(`/analisi/${id}/duplica`, {
      nuovaData: nuovaData || new Date().toISOString().split('T')[0]
    });
    return response.data;
  }
  
  /**
   * Bulk validation - valida multiple analisi in una sola chiamata
   */
  static async validaMultiple(ids: number[]): Promise<ApiResponse<{
    successo: number[];
    errori: { id: number; errore: string }[];
  }>> {
    const response = await api.put('/analisi/valida-multiple', { ids });
    return response.data;
  }
  
  /**
   * Ottiene il report di conformità per un periodo
   */
  static async getReportConformita(
    dataInizio: string,
    dataFine: string,
    comuneId?: number,
    flussoId?: number
  ): Promise<ApiResponse<{
    periodo: { dataInizio: string; dataFine: string };
    riepilogo: {
      totaleAnalisi: number;
      analisiConformi: number;
      percentualeConformita: number;
    };
    dettagliPerComune: {
      comune_id: number;
      comune_nome: string;
      totale: number;
      conformi: number;
      percentuale: number;
    }[];
    dettagliPerFlusso: {
      flusso_id: number;
      flusso_nome: string;
      totale: number;
      conformi: number;
      percentuale: number;
    }[];
    violazioniPiuFrequenti: {
      tipo: string;
      occorrenze: number;
      percentuale: number;
    }[];
  }>> {
    const response = await api.get('/analisi/report-conformita', {
      params: {
        dataInizio,
        dataFine,
        comuneId,
        flussoId
      }
    });
    return response.data;
  }
}