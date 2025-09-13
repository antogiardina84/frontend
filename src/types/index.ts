// frontend/src/types/index.ts

// Tipi base
export interface BaseEntity {
  id: number;
  created_at?: string;
  updated_at?: string;
}

// Comune
export interface Comune extends BaseEntity {
  codice_istat: string;
  nome: string;
  provincia: string;
  regione: string;
  abitanti?: number;
  delega_attiva: boolean;
  codice_delega?: string;
}

// Tipologia Materiale
export interface TipologiaMateriale extends BaseEntity {
  codice: string;
  nome: string;
  descrizione?: string;
  cer?: string;
  consorzio?: string;
  prezzo_medio?: number;
  attivo: boolean;
}

// Flusso COREPLA
export interface FlussoCorepla extends BaseEntity {
  codice: string; // A, B, C, D
  nome: string;
  descrizione?: string;
  corrispettivo_unitario: number;
  limite_traccianti?: number |'' | null,
  limite_frazione_estranea?: number |'' | null;
  limite_cpl?: number |'' | null;
  attivo: boolean;
}

// Ingresso
export interface Ingresso extends BaseEntity {
  data_conferimento: string;
  numero_formulario?: string;
  data_formulario?: string;
  comune_id: number;
  tipologia_materiale_id: number;
  quantita_kg: number;
  flusso_id?: number;
  note?: string;
  
  // Relazioni
  Comune?: Comune;
  TipologiaMateriale?: TipologiaMateriale;
  FlussoCorepla?: FlussoCorepla;
}

// Lavorazione
export interface Lavorazione extends BaseEntity {
  data_lavorazione: string;
  tipologia_materiale_id: number;
  quantita_kg: number;
  flusso_origine_id?: number;
  tipo_operazione: 'selezione' | 'pressatura' | 'stoccaggio';
  note?: string;
  
  // Relazioni
  TipologiaMateriale?: TipologiaMateriale;
  FlussoCorepla?: FlussoCorepla;
}

// Uscita
export interface Uscita extends BaseEntity {
  data_uscita: string;
  numero_documento?: string;
  numero_formulario?: string;
  destinatario: string;
  indirizzo_destinatario?: string;
  tipologia_materiale_id: number;
  quantita_kg: number;
  prezzo_unitario?: number;
  valore_totale?: number;
  tipo_destinazione?: 'riciclo' | 'recupero_energetico' | 'smaltimento';
  flusso_id?: number;
  mezzo_trasporto?: string;
  autista?: string;
  note?: string;
  
  // Relazioni
  TipologiaMateriale?: TipologiaMateriale;
  FlussoCorepla?: FlussoCorepla;
}

// Analisi Qualitativa
export interface AnalisiQualitativa extends BaseEntity {
  data_analisi: string;
  numero_formulario?: string;
  data_formulario?: string;
  comune_id: number;
  flusso_id: number;
  
  // Percentuali secondo Metodo AQ20
  perc_cpl_pet: number;
  perc_altri_cpl: number;
  perc_traccianti: number;
  perc_cassette_cac: number;
  perc_imballaggi_conip: number;
  perc_imballaggi_vari: number;
  perc_frazione_estranea: number;
  perc_frazione_fine: number;
  perc_frazione_neutra: number;
  
  peso_campione_kg?: number;
  note?: string;
  validata: boolean;
  
  // Campi calcolati
  imballaggi_complessivi?: number;
  
  // Relazioni
  Comune?: Comune;
  FlussoCorepla?: FlussoCorepla;
}

// Fatturazione
export interface Fatturazione extends BaseEntity {
  numero_fattura: string;
  data_fattura: string;
  mese_riferimento: number;
  anno_riferimento: number;
  consorzio: string;
  quantita_kg: number;
  corrispettivo_unitario: number;
  importo_netto: number;
  stato: 'bozza' | 'inviata' | 'pagata';
  data_invio?: string;
  data_pagamento?: string;
  note?: string;
}

// Costo
export interface Costo extends BaseEntity {
  data_costo: string;
  categoria: 'personale' | 'utilities' | 'manutenzione' | 'trasporti' | 'smaltimento';
  descrizione: string;
  importo: number;
  tipologia_materiale_id?: number;
  fornitore?: string;
  numero_documento?: string;
  note?: string;
  
  // Relazioni
  TipologiaMateriale?: TipologiaMateriale;
}

// Giacenza
export interface Giacenza extends BaseEntity {
  data_riferimento: string;
  tipologia_materiale_id: number;
  quantita_kg: number;
  valore_unitario?: number;
  valore_totale?: number;
  ultimo_aggiornamento: string;
  
  // Relazioni
  TipologiaMateriale?: TipologiaMateriale;
}

export interface GiacenzaCalcolata {
  tipologia_materiale_id: number;
  tipologia_nome: string;
  data_riferimento: string;
  quantita_kg: number;
  valore_unitario: number;
  valore_totale: number;
  totale_ingressi: number;
  totale_uscite: number;
  totale_lavorazioni: number;
}

export interface MovimentoMagazzino {
  data: string;
  tipo: 'ingresso' | 'uscita' | 'lavorazione_input' | 'lavorazione_output';
  descrizione: string;
  tipologia: string;
  quantita_kg: number;
  segno: '+' | '-';
  dettagli: any;
}

export interface AndamentoRaccolta {
  data: {
    anno: number;
    mese: number;
    periodo: string;
    ingressi_kg: number;
    uscite_kg: number;
    bilancio_kg: number;
  }[];
}

// Tipi per filtri e paginazione
export interface FiltriBase {
  dataInizio?: string;
  dataFine?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface FiltriIngressi extends FiltriBase {
  comuneId?: number;
  tipologiaId?: number;
  flussoId?: number;
}

export interface FiltriUscite extends FiltriBase {
  tipologiaId?: number;
  destinatario?: string;
}

export interface FiltriLavorazioni extends FiltriBase {
  tipoLavorazione?: string;
  materialeInputId?: number;
  materialeOutputId?: number;
}

export interface FiltriAnalisi extends FiltriBase {
  comuneId?: number;
  flussoId?: number;
  validata?: boolean;
}

export interface FiltriFatturazione extends FiltriBase {
  mese?: number;
  anno?: number;
  consorzio?: string;
  stato?: string;
}

export interface Paginazione {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: Paginazione;
  message?: string;
  error?: string;
}

// Form data types - CORRETTI per compatibilità
export interface IngressoFormData {
  data_conferimento: string;
  numero_formulario?: string;
  data_formulario?: string;
  comune_id: number | '';
  tipologia_materiale_id: number | '';
  quantita_kg: number | '';
  flusso_id?: number | '';
  note?: string;
}

export interface UscitaFormData {
  data_uscita: string;
  numero_documento?: string;
  numero_formulario?: string;
  destinatario: string;
  indirizzo_destinatario?: string;
  tipologia_materiale_id: number | '';
  quantita_kg: number | '';
  prezzo_unitario?: number | '' | undefined;  // Permette anche undefined
  valore_totale?: number | '' | undefined;     // Permette anche undefined
  tipo_destinazione?: 'riciclo' | 'recupero_energetico' | 'smaltimento' | '';
  flusso_id?: number | '' | undefined;         // Permette anche undefined
  mezzo_trasporto?: string;
  autista?: string;
  note?: string;
}

export interface AnalisiFormData {
  data_analisi: string;
  numero_formulario?: string;
  data_formulario?: string;
  comune_id: number | '';
  flusso_id: number | '';
  perc_cpl_pet: number | '';
  perc_altri_cpl: number | '';
  perc_traccianti: number | '';
  perc_cassette_cac: number | '';
  perc_imballaggi_conip: number | '';
  perc_imballaggi_vari: number | '';
  perc_frazione_estranea: number | '';
  perc_frazione_fine: number | '';
  perc_frazione_neutra: number | '';
  peso_campione_kg?: number | '';
  note?: string;
}

export interface CostoFormData {
  data_costo: string;
  categoria: 'personale' | 'utilities' | 'manutenzione' | 'trasporti' | 'smaltimento' | '';
  descrizione: string;
  importo: number | '';
  tipologia_materiale_id?: number | '';
  fornitore?: string;
  numero_documento?: string;
  note?: string;
}

export interface LavorazioneFormData {
  data_lavorazione: string;
  tipologia_materiale_id: number | '';
  quantita_kg: number | '';
  flusso_origine_id?: number | '';
  tipo_operazione: 'selezione' | 'pressatura' | 'stoccaggio' | '';
  note?: string;
}

// Tipi per i calcoli COREPLA
export interface CalcoliCorepla {
  media_mobile: MediaMobileQuadrimestrale;
  quote_competenza: QuoteCompetenzaCalcolate;
  conformita: VerificaConformita;
  corrispettivo?: CorrisptettiroNetto;
}

export interface MediaMobileQuadrimestrale {
  perc_cpl_pet: number;
  perc_altri_cpl: number;
  perc_traccianti: number;
  perc_cassette_cac: number;
  perc_imballaggi_conip: number;
  perc_imballaggi_vari: number;
  perc_frazione_estranea: number;
  perc_frazione_fine: number;
}

export interface QuoteCompetenzaCalcolate {
  imballaggi_complessivi: number;
  cpl_pet_totali: number;
  cpl_pet_corepla: number;
  altri_cpl_corepla: number;
  traccianti_corepla: number;
  cassette_cac_corepla: number;
  imballaggi_vari_corepla: number;
  imballaggi_corepla_totali: number;
}

export interface VerificaConformita {
  conforme: boolean;
  violazioni: string[];
}

export interface CorrisptettiroNetto {
  quantita_kg: number;
  icc_tonnellate: number;
  corrispettivo_unitario: number;
  corrispettivo_lordo: number;
  frazione_estranea_kg?: number;
  costo_frazione_estranea?: number;
  corrispettivo_netto: number;
}

// Tipi per i report
export interface ReportRiepilogoMensile {
  periodo: { mese: number; anno: number };
  ingressi: {
    totale_kg: number;
    numero_conferimenti: number;
  };
  uscite: {
    totale_kg: number;
    numero_spedizioni: number;
  };
  lavorazioni: {
    input_kg: number;
    output_kg: number;
    numero_lavorazioni: number;
    efficienza_media: number;
  };
  bilancio: {
    differenza_kg: number;
    tasso_lavorazione: number;
  };
  riepilogo_comuni: {
    comune_id: number;
    Comune?: Comune;
    totale_kg: number;
  }[];
}

// Tipi per le notifiche
export interface Notifica {
  id: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titolo: string;
  messaggio: string;
  timestamp: string;
  letta: boolean;
}

// Costanti per i consorzi
export const CONSORZI = [
  'COREPLA',
  'CORIPET', 
  'RICREA',
  'CIAL',
  'COREVE'
] as const;

// Costanti per le tipologie di operazione
export const TIPI_OPERAZIONE = [
  'selezione',
  'pressatura', 
  'stoccaggio'
] as const;

// Costanti per le categorie di costo
export const CATEGORIE_COSTO = [
  'personale',
  'utilities',
  'manutenzione',
  'trasporti',
  'smaltimento'
] as const;

// Costanti per i tipi di destinazione
export const TIPI_DESTINAZIONE = [
  'riciclo',
  'recupero_energetico',
  'smaltimento'
] as const;

// Costanti per gli stati fatturazione
export const STATI_FATTURAZIONE = [
  'bozza',
  'inviata',
  'pagata'
] as const;