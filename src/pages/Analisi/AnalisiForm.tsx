// frontend/src/pages/Analisi/AnalisiForm.tsx
import React from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { AnalisiQualitativa, Comune, FlussoCorepla, AnalisiFormData } from '../../types';
import { AnalisiService } from '../../services/AnalisiService';
import { useForm } from '../../hooks/useForm';
import { useNotifiche } from '../../contexts/NotificheContext';
import { required, isNumber, minValue, maxValue } from '../../utils/validation';

interface AnalisiFormProps {
  analisi: AnalisiQualitativa | null;
  comuni: Comune[];
  flussi: FlussoCorepla[];
  onSalva: () => void;
  onAnnulla: () => void;
}

// Funzioni helper per gestire le date
const parseDate = (dateString: string | null | undefined): Dayjs | null => {
  if (!dateString || dateString === '' || dateString === 'null' || dateString === 'undefined') {
    return null;
  }
  
  try {
    const date = dayjs(dateString);
    if (!date.isValid()) {
      return null;
    }
    return date;
  } catch (error) {
    console.warn('Errore parsing data:', dateString, error);
    return null;
  }
};

const formatDateForInput = (date: Dayjs | null | undefined): string => {
  if (!date || !dayjs.isDayjs(date) || !date.isValid()) {
    return '';
  }
  
  try {
    return date.format('YYYY-MM-DD');
  } catch (error) {
    console.warn('Errore formattazione data:', date, error);
    return '';
  }
};

const AnalisiForm: React.FC<AnalisiFormProps> = ({
  analisi,
  comuni,
  flussi,
  onSalva,
  onAnnulla,
}) => {
  const { aggiungiNotifica } = useNotifiche();

  const initialValues: AnalisiFormData = {
    data_analisi: analisi?.data_analisi || new Date().toISOString().split('T')[0],
    comune_id: analisi?.comune_id || '',
    flusso_id: analisi?.flusso_id || '',
    perc_cpl_pet: analisi?.perc_cpl_pet || '',
    perc_altri_cpl: analisi?.perc_altri_cpl || '',
    perc_traccianti: analisi?.perc_traccianti || '',
    perc_cassette_cac: analisi?.perc_cassette_cac || '',
    perc_imballaggi_conip: analisi?.perc_imballaggi_conip || '',
    perc_imballaggi_vari: analisi?.perc_imballaggi_vari || '',
    perc_frazione_estranea: analisi?.perc_frazione_estranea || '',
    perc_frazione_fine: analisi?.perc_frazione_fine || '',
    perc_frazione_neutra: analisi?.perc_frazione_neutra || '',
    peso_campione_kg: analisi?.peso_campione_kg || '',
    note: analisi?.note || '',
  };

  const validate = (values: AnalisiFormData) => {
    const errors: Partial<Record<keyof AnalisiFormData, string>> = {};

    // Validazione data analisi
    const dataError = required(values.data_analisi);
    if (dataError) errors.data_analisi = dataError;

    // Validazione comune
    const comuneError = required(values.comune_id);
    if (comuneError) errors.comune_id = comuneError;

    // Validazione flusso
    const flussoError = required(values.flusso_id);
    if (flussoError) errors.flusso_id = flussoError;

    // Validazione percentuali
    const validatePercentage = (value: string | number, fieldName: string) => {
      const requiredError = required(value);
      if (requiredError) {
        return requiredError;
      }
      
      const numberError = isNumber(value);
      if (numberError) {
        return numberError;
      }
      
      const minError = minValue(0)(Number(value));
      if (minError) {
        return minError;
      }
      
      const maxError = maxValue(100)(Number(value));
      if (maxError) {
        return maxError;
      }
      
      return null;
    };

    // Valida tutte le percentuali
    const percCplPetError = validatePercentage(values.perc_cpl_pet, 'perc_cpl_pet');
    if (percCplPetError) errors.perc_cpl_pet = percCplPetError;

    const percAltriCplError = validatePercentage(values.perc_altri_cpl, 'perc_altri_cpl');
    if (percAltriCplError) errors.perc_altri_cpl = percAltriCplError;

    const percTracciantiError = validatePercentage(values.perc_traccianti, 'perc_traccianti');
    if (percTracciantiError) errors.perc_traccianti = percTracciantiError;

    const percCassetteCacError = validatePercentage(values.perc_cassette_cac, 'perc_cassette_cac');
    if (percCassetteCacError) errors.perc_cassette_cac = percCassetteCacError;

    const percImballaggiConipError = validatePercentage(values.perc_imballaggi_conip, 'perc_imballaggi_conip');
    if (percImballaggiConipError) errors.perc_imballaggi_conip = percImballaggiConipError;

    const percImballaggiVariError = validatePercentage(values.perc_imballaggi_vari, 'perc_imballaggi_vari');
    if (percImballaggiVariError) errors.perc_imballaggi_vari = percImballaggiVariError;

    const percFrazioneEstraneaError = validatePercentage(values.perc_frazione_estranea, 'perc_frazione_estranea');
    if (percFrazioneEstraneaError) errors.perc_frazione_estranea = percFrazioneEstraneaError;

    const percFrazioneFineError = validatePercentage(values.perc_frazione_fine, 'perc_frazione_fine');
    if (percFrazioneFineError) errors.perc_frazione_fine = percFrazioneFineError;

    const percFrazioneNeutraError = validatePercentage(values.perc_frazione_neutra, 'perc_frazione_neutra');
    if (percFrazioneNeutraError) errors.perc_frazione_neutra = percFrazioneNeutraError;

    // Validazione somma percentuali non superiore al 100%
    const totalePercentuali = Number(values.perc_cpl_pet || 0) + 
                             Number(values.perc_altri_cpl || 0) + 
                             Number(values.perc_traccianti || 0) + 
                             Number(values.perc_cassette_cac || 0) + 
                             Number(values.perc_imballaggi_conip || 0) + 
                             Number(values.perc_imballaggi_vari || 0) + 
                             Number(values.perc_frazione_estranea || 0) + 
                             Number(values.perc_frazione_fine || 0) + 
                             Number(values.perc_frazione_neutra || 0);
    
    if (totalePercentuali > 100) {
      errors.perc_cpl_pet = 'La somma delle percentuali non può superare il 100%';
    }

    return errors;
  };

  const handleSubmit = async (values: AnalisiFormData) => {
    try {
      const data = {
        ...values,
        comune_id: Number(values.comune_id),
        flusso_id: Number(values.flusso_id),
        perc_cpl_pet: Number(values.perc_cpl_pet),
        perc_altri_cpl: Number(values.perc_altri_cpl),
        perc_traccianti: Number(values.perc_traccianti),
        perc_cassette_cac: Number(values.perc_cassette_cac),
        perc_imballaggi_conip: Number(values.perc_imballaggi_conip),
        perc_imballaggi_vari: Number(values.perc_imballaggi_vari),
        perc_frazione_estranea: Number(values.perc_frazione_estranea),
        perc_frazione_fine: Number(values.perc_frazione_fine),
        perc_frazione_neutra: Number(values.perc_frazione_neutra),
        peso_campione_kg: values.peso_campione_kg ? Number(values.peso_campione_kg) : undefined,
        validata: false, // Sempre false per nuove analisi
      };

      if (analisi) {
        await AnalisiService.updateAnalisi(analisi.id, data);
      } else {
        await AnalisiService.createAnalisi(data);
      }

      onSalva();
    } catch (error: any) {
      console.error('Errore salvataggio analisi:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: error.response?.data?.message || 'Errore nel salvataggio dell\'analisi',
      });
    }
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit: onSubmit,
  } = useForm({
    initialValues,
    validate,
    onSubmit: handleSubmit,
  });

  // Calcolo totale percentuali per feedback visivo
  const totalePercentuali = Number(values.perc_cpl_pet || 0) + 
                           Number(values.perc_altri_cpl || 0) + 
                           Number(values.perc_traccianti || 0) + 
                           Number(values.perc_cassette_cac || 0) + 
                           Number(values.perc_imballaggi_conip || 0) + 
                           Number(values.perc_imballaggi_vari || 0) + 
                           Number(values.perc_frazione_estranea || 0) + 
                           Number(values.perc_frazione_fine || 0) + 
                           Number(values.perc_frazione_neutra || 0);

  return (
    <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <DialogTitle>
        {analisi ? 'Modifica Analisi Qualitativa' : 'Nuova Analisi Qualitativa'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Prima riga - Data e Comune */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <DatePicker
                label="Data Analisi"
                value={parseDate(values.data_analisi)} // FIX: Usa parseDate invece di new Date() diretto
                onChange={(date) => handleChange('data_analisi', formatDateForInput(date))} // FIX: Usa formatDateForInput
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.data_analisi,
                    helperText: errors.data_analisi,
                  }
                }}
              />
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <FormControl fullWidth error={!!errors.comune_id}>
                <InputLabel>Comune</InputLabel>
                <Select
                  value={values.comune_id}
                  onChange={(e) => handleChange('comune_id', e.target.value)}
                  label="Comune"
                >
                  {comuni.map((comune) => (
                    <MenuItem key={comune.id} value={comune.id}>
                      {comune.nome} ({comune.codice_istat})
                    </MenuItem>
                  ))}
                </Select>
                {errors.comune_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.comune_id}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </Box>

          {/* Seconda riga - Flusso e Peso */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <FormControl fullWidth error={!!errors.flusso_id}>
                <InputLabel>Flusso COREPLA</InputLabel>
                <Select
                  value={values.flusso_id}
                  onChange={(e) => handleChange('flusso_id', e.target.value)}
                  label="Flusso COREPLA"
                >
                  {flussi.map((flusso) => (
                    <MenuItem key={flusso.id} value={flusso.id}>
                      Flusso {flusso.codice} - {flusso.nome}
                    </MenuItem>
                  ))}
                </Select>
                {errors.flusso_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.flusso_id}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Peso Campione (kg)"
                type="number"
                value={values.peso_campione_kg}
                onChange={(e) => handleChange('peso_campione_kg', e.target.value)}
                error={!!errors.peso_campione_kg}
                helperText={errors.peso_campione_kg}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Box>
          </Box>

          {/* Sezione Percentuali */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2, color: 'primary.main' }}>
            Percentuali Analisi Qualitativa (Metodo AQ20)
          </Typography>

          {/* Prima riga percentuali */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="CPL PET (%)"
                type="number"
                value={values.perc_cpl_pet}
                onChange={(e) => handleChange('perc_cpl_pet', e.target.value)}
                error={!!errors.perc_cpl_pet}
                helperText={errors.perc_cpl_pet}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Altri CPL (%)"
                type="number"
                value={values.perc_altri_cpl}
                onChange={(e) => handleChange('perc_altri_cpl', e.target.value)}
                error={!!errors.perc_altri_cpl}
                helperText={errors.perc_altri_cpl}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Box>
          </Box>

          {/* Seconda riga percentuali */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Traccianti (%)"
                type="number"
                value={values.perc_traccianti}
                onChange={(e) => handleChange('perc_traccianti', e.target.value)}
                error={!!errors.perc_traccianti}
                helperText={errors.perc_traccianti}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Cassette CAC (%)"
                type="number"
                value={values.perc_cassette_cac}
                onChange={(e) => handleChange('perc_cassette_cac', e.target.value)}
                error={!!errors.perc_cassette_cac}
                helperText={errors.perc_cassette_cac}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Box>
          </Box>

          {/* Terza riga percentuali */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Imballaggi CONIP (%)"
                type="number"
                value={values.perc_imballaggi_conip}
                onChange={(e) => handleChange('perc_imballaggi_conip', e.target.value)}
                error={!!errors.perc_imballaggi_conip}
                helperText={errors.perc_imballaggi_conip}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Imballaggi Vari (%)"
                type="number"
                value={values.perc_imballaggi_vari}
                onChange={(e) => handleChange('perc_imballaggi_vari', e.target.value)}
                error={!!errors.perc_imballaggi_vari}
                helperText={errors.perc_imballaggi_vari}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Box>
          </Box>

          {/* Quarta riga percentuali */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Frazione Estranea (%)"
                type="number"
                value={values.perc_frazione_estranea}
                onChange={(e) => handleChange('perc_frazione_estranea', e.target.value)}
                error={!!errors.perc_frazione_estranea}
                helperText={errors.perc_frazione_estranea}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Frazione Fine (%)"
                type="number"
                value={values.perc_frazione_fine}
                onChange={(e) => handleChange('perc_frazione_fine', e.target.value)}
                error={!!errors.perc_frazione_fine}
                helperText={errors.perc_frazione_fine}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Box>
          </Box>

          {/* Quinta riga percentuali */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <TextField
                fullWidth
                label="Frazione Neutra (%)"
                type="number"
                value={values.perc_frazione_neutra}
                onChange={(e) => handleChange('perc_frazione_neutra', e.target.value)}
                error={!!errors.perc_frazione_neutra}
                helperText={errors.perc_frazione_neutra}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Box>
          </Box>

          {/* Indicatore totale percentuali */}
          <Box sx={{ 
            p: 2, 
            bgcolor: totalePercentuali > 100 ? 'error.light' : 'success.light',
            borderRadius: 1,
            color: totalePercentuali > 100 ? 'error.contrastText' : 'success.contrastText',
            mb: 2
          }}>
            <Typography variant="body2">
              Totale percentuali: {totalePercentuali.toFixed(1)}%
              {totalePercentuali > 100 && ' - Attenzione: il totale supera il 100%!'}
              {totalePercentuali < 100 && ` - Mancano ${(100 - totalePercentuali).toFixed(1)}% per raggiungere il 100%`}
            </Typography>
          </Box>

          {/* Note */}
          <TextField
            fullWidth
            label="Note"
            multiline
            rows={3}
            value={values.note}
            onChange={(e) => handleChange('note', e.target.value)}
            placeholder="Note aggiuntive sull'analisi..."
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onAnnulla}>
          Annulla
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || totalePercentuali > 100}
        >
          {isSubmitting ? 'Salvataggio...' : 'Salva'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default AnalisiForm;