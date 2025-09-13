// frontend/src/pages/Uscite/UscitaForm.tsx
import React, { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Uscita, TipologiaMateriale, FlussoCorepla, UscitaFormData } from '../../types';
import { UsciteService } from '../../services/UsciteService';
import { useForm } from '../../hooks/useForm';
import { useNotifiche } from '../../contexts/NotificheContext';
import { required, isNumber, minValue } from '../../utils/validation';

interface UscitaFormProps {
  uscita: Uscita | null;
  tipologie: TipologiaMateriale[];
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

const UscitaForm: React.FC<UscitaFormProps> = ({
  uscita,
  tipologie,
  flussi,
  onSalva,
  onAnnulla,
}) => {
  const { aggiungiNotifica } = useNotifiche();
  const [loading, setLoading] = useState(false);

  const initialValues: UscitaFormData = {
    data_uscita: uscita?.data_uscita || new Date().toISOString().split('T')[0],
    numero_documento: uscita?.numero_documento || '',
    destinatario: uscita?.destinatario || '',
    indirizzo_destinatario: uscita?.indirizzo_destinatario || '',
    tipologia_materiale_id: uscita?.tipologia_materiale_id || '',
    quantita_kg: uscita?.quantita_kg || '',
    prezzo_unitario: uscita?.prezzo_unitario || '',
    valore_totale: uscita?.valore_totale || '',
    flusso_id: uscita?.flusso_id || '',
    mezzo_trasporto: uscita?.mezzo_trasporto || '',
    autista: uscita?.autista || '',
    note: uscita?.note || '',
  };

  const validate = (values: UscitaFormData) => {
    const errors: Partial<Record<keyof UscitaFormData, string>> = {};

    const dataError = required(values.data_uscita);
    if (dataError) errors.data_uscita = dataError;

    const destinatarioError = required(values.destinatario);
    if (destinatarioError) errors.destinatario = destinatarioError;

    const tipologiaError = required(values.tipologia_materiale_id);
    if (tipologiaError) errors.tipologia_materiale_id = tipologiaError;

    const quantitaRequiredError = required(values.quantita_kg);
    if (quantitaRequiredError) {
      errors.quantita_kg = quantitaRequiredError;
    } else {
      const quantitaNumberError = isNumber(values.quantita_kg);
      if (quantitaNumberError) {
        errors.quantita_kg = quantitaNumberError;
      } else {
        const quantitaMinError = minValue(0.1)(Number(values.quantita_kg));
        if (quantitaMinError) errors.quantita_kg = quantitaMinError;
      }
    }

    if (values.prezzo_unitario) {
      const prezzoNumberError = isNumber(values.prezzo_unitario);
      if (prezzoNumberError) {
        errors.prezzo_unitario = prezzoNumberError;
      } else {
        const prezzoMinError = minValue(0)(Number(values.prezzo_unitario));
        if (prezzoMinError) errors.prezzo_unitario = prezzoMinError;
      }
    }

    return errors;
  };

  const handleSubmit = async (values: UscitaFormData) => {
    setLoading(true);
    try {
      const data = {
        ...values,
        tipologia_materiale_id: Number(values.tipologia_materiale_id),
        quantita_kg: Number(values.quantita_kg),
        prezzo_unitario: values.prezzo_unitario ? Number(values.prezzo_unitario) : undefined,
        valore_totale: values.valore_totale ? Number(values.valore_totale) : undefined,
        flusso_id: values.flusso_id ? Number(values.flusso_id) : undefined,
      };

      if (uscita) {
        await UsciteService.updateUscita(uscita.id, data);
      } else {
        await UsciteService.createUscita(data);
      }

      onSalva();
    } catch (error: any) {
      console.error('Errore salvataggio uscita:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: error.response?.data?.message || 'Errore nel salvataggio dell\'uscita',
      });
    } finally {
      setLoading(false);
    }
  };

  const { values, errors, handleChange, handleSubmit: onSubmit } = useForm({
    initialValues,
    validate,
    onSubmit: handleSubmit,
  });

  // Calcolo automatico del valore totale
  React.useEffect(() => {
    if (values.quantita_kg && values.prezzo_unitario) {
      const valore = Number(values.quantita_kg) * Number(values.prezzo_unitario);
      handleChange('valore_totale', valore.toFixed(2));
    }
  }, [values.quantita_kg, values.prezzo_unitario, handleChange]);

  return (
    <>
      <DialogTitle>
        {uscita ? 'Modifica Uscita' : 'Nuova Uscita'}
      </DialogTitle>

      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          {/* Prima riga - Dati principali */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%' }, minWidth: 0 }}>
              <DatePicker
                label="Data Uscita *"
                value={parseDate(values.data_uscita)} // FIX: Usa parseDate
                onChange={(date) => handleChange('data_uscita', formatDateForInput(date))} // FIX: Usa formatDateForInput
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.data_uscita,
                    helperText: errors.data_uscita,
                  },
                }}
              />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%' }, minWidth: 0 }}>
              <TextField
                fullWidth
                label="Numero Documento"
                value={values.numero_documento}
                onChange={(e) => handleChange('numero_documento', e.target.value)}
                error={!!errors.numero_documento}
                helperText={errors.numero_documento}
              />
            </Box>
          </Box>

          {/* Seconda riga - Destinatario */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 66.66%' }, minWidth: 0 }}>
              <TextField
                fullWidth
                label="Destinatario *"
                value={values.destinatario}
                onChange={(e) => handleChange('destinatario', e.target.value)}
                error={!!errors.destinatario}
                helperText={errors.destinatario}
              />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' }, minWidth: 0 }}>
              <FormControl fullWidth error={!!errors.tipologia_materiale_id}>
                <InputLabel>Tipologia *</InputLabel>
                <Select
                  value={values.tipologia_materiale_id}
                  onChange={(e) => handleChange('tipologia_materiale_id', e.target.value)}
                  label="Tipologia *"
                >
                  {tipologie.map((tipologia) => (
                    <MenuItem key={tipologia.id} value={tipologia.id}>
                      {tipologia.nome}
                    </MenuItem>
                  ))}
                </Select>
                {errors.tipologia_materiale_id && (
                  <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                    {errors.tipologia_materiale_id}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </Box>

          {/* Terza riga - Indirizzo */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Indirizzo Destinatario"
              value={values.indirizzo_destinatario}
              onChange={(e) => handleChange('indirizzo_destinatario', e.target.value)}
              multiline
              rows={2}
            />
          </Box>

          {/* Quarta riga - Quantità e prezzi */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' }, minWidth: 0 }}>
              <TextField
                fullWidth
                label="Quantità (kg) *"
                type="number"
                value={values.quantita_kg}
                onChange={(e) => handleChange('quantita_kg', e.target.value)}
                error={!!errors.quantita_kg}
                helperText={errors.quantita_kg}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' }, minWidth: 0 }}>
              <TextField
                fullWidth
                label="Prezzo Unitario (€/kg)"
                type="number"
                value={values.prezzo_unitario}
                onChange={(e) => handleChange('prezzo_unitario', e.target.value)}
                error={!!errors.prezzo_unitario}
                helperText={errors.prezzo_unitario}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' }, minWidth: 0 }}>
              <TextField
                fullWidth
                label="Valore Totale (€)"
                type="number"
                value={values.valore_totale}
                onChange={(e) => handleChange('valore_totale', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{ readOnly: true }}
                sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
              />
            </Box>
          </Box>

          {/* Quinta riga - Flusso e trasporto */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' }, minWidth: 0 }}>
              <FormControl fullWidth>
                <InputLabel>Flusso COREPLA</InputLabel>
                <Select
                  value={values.flusso_id || ''}
                  onChange={(e) => handleChange('flusso_id', e.target.value)}
                  label="Flusso COREPLA"
                >
                  <MenuItem value="">Nessuno</MenuItem>
                  {flussi.map((flusso) => (
                    <MenuItem key={flusso.id} value={flusso.id}>
                      {flusso.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' }, minWidth: 0 }}>
              <TextField
                fullWidth
                label="Mezzo di Trasporto"
                value={values.mezzo_trasporto}
                onChange={(e) => handleChange('mezzo_trasporto', e.target.value)}
                placeholder="es. Targa camion"
              />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33%' }, minWidth: 0 }}>
              <TextField
                fullWidth
                label="Autista"
                value={values.autista}
                onChange={(e) => handleChange('autista', e.target.value)}
              />
            </Box>
          </Box>

          {/* Sesta riga - Note */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Note"
              value={values.note}
              onChange={(e) => handleChange('note', e.target.value)}
              multiline
              rows={3}
              placeholder="Note aggiuntive sulla spedizione..."
            />
          </Box>

          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Correggi gli errori prima di salvare
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onAnnulla} disabled={loading}>
          Annulla
        </Button>
        <Button 
          onClick={onSubmit} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Salvataggio...' : 'Salva'}
        </Button>
      </DialogActions>
    </>
  );
};

export default UscitaForm;