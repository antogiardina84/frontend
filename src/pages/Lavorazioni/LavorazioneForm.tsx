import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

import { Lavorazione, TipologiaMateriale, FlussoCorepla, LavorazioneFormData } from '../../types';
import { LavorazioniService } from '../../services/LavorazioniService';
import { useNotifiche } from '../../contexts/NotificheContext';

interface LavorazioneFormProps {
  lavorazione?: Lavorazione | null;
  tipologie: TipologiaMateriale[];
  flussi: FlussoCorepla[];
  onSalva: () => void;
  onAnnulla: () => void;
}

const tipiOperazione = [
  { value: 'selezione', label: 'Selezione' },
  { value: 'pressatura', label: 'Pressatura' },
  { value: 'stoccaggio', label: 'Stoccaggio' },
];

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

const LavorazioneForm: React.FC<LavorazioneFormProps> = ({
  lavorazione,
  tipologie,
  flussi,
  onSalva,
  onAnnulla,
}) => {
  const [formData, setFormData] = useState<LavorazioneFormData>({
    data_lavorazione: '',
    tipologia_materiale_id: '',
    quantita_kg: '',
    flusso_origine_id: '',
    tipo_operazione: '',
    note: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { aggiungiNotifica } = useNotifiche();

  useEffect(() => {
    if (lavorazione) {
      setFormData({
        data_lavorazione: lavorazione.data_lavorazione,
        tipologia_materiale_id: lavorazione.tipologia_materiale_id,
        quantita_kg: lavorazione.quantita_kg,
        flusso_origine_id: lavorazione.flusso_origine_id || '',
        tipo_operazione: lavorazione.tipo_operazione,
        note: lavorazione.note || '',
      });
    } else {
      // Reset per nuova lavorazione
      setFormData({
        data_lavorazione: new Date().toISOString().split('T')[0],
        tipologia_materiale_id: '',
        quantita_kg: '',
        flusso_origine_id: '',
        tipo_operazione: '',
        note: '',
      });
    }
  }, [lavorazione]);

  const handleChange = (field: keyof LavorazioneFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.data_lavorazione) {
      newErrors.data_lavorazione = 'Data lavorazione è obbligatoria';
    }

    if (!formData.tipologia_materiale_id) {
      newErrors.tipologia_materiale_id = 'Tipologia materiale è obbligatoria';
    }

    if (!formData.quantita_kg || formData.quantita_kg <= 0) {
      newErrors.quantita_kg = 'Quantità deve essere maggiore di 0';
    }

    if (!formData.tipo_operazione) {
      newErrors.tipo_operazione = 'Tipo operazione è obbligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Convert form data to the correct types
      const dataToSubmit: LavorazioneFormData = {
        ...formData,
        tipologia_materiale_id: Number(formData.tipologia_materiale_id),
        quantita_kg: Number(formData.quantita_kg),
        flusso_origine_id: formData.flusso_origine_id ? Number(formData.flusso_origine_id) : undefined,
      };

      if (lavorazione) {
        // Update existing lavorazione
        // await LavorazioniService.updateLavorazione(lavorazione.id, dataToSubmit);
        console.log('Update lavorazione:', dataToSubmit);
      } else {
        // Create new lavorazione
        await LavorazioniService.createLavorazione(dataToSubmit);
      }

      aggiungiNotifica({
        tipo: 'success',
        titolo: 'Successo',
        messaggio: lavorazione ? 'Lavorazione aggiornata con successo' : 'Lavorazione creata con successo',
      });

      onSalva();
    } catch (error) {
      console.error('Errore salvataggio lavorazione:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: 'Errore nel salvataggio della lavorazione',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>
        {lavorazione ? 'Modifica Lavorazione' : 'Nuova Lavorazione'}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 250, flex: 1 }}>
              <DatePicker
                label="Data Lavorazione *"
                value={parseDate(formData.data_lavorazione)} // FIX: Usa parseDate
                onChange={(date) => handleChange('data_lavorazione', formatDateForInput(date))} // FIX: Usa formatDateForInput
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.data_lavorazione,
                    helperText: errors.data_lavorazione,
                  },
                }}
              />
            </Box>

            <Box sx={{ minWidth: 250, flex: 1 }}>
              <FormControl fullWidth error={!!errors.tipo_operazione}>
                <InputLabel>Tipo Operazione *</InputLabel>
                <Select
                  value={formData.tipo_operazione}
                  onChange={(e) => handleChange('tipo_operazione', e.target.value)}
                  label="Tipo Operazione *"
                >
                  {tipiOperazione.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.tipo_operazione && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {errors.tipo_operazione}
                  </Alert>
                )}
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 250, flex: 1 }}>
              <FormControl fullWidth error={!!errors.tipologia_materiale_id}>
                <InputLabel>Tipologia Materiale *</InputLabel>
                <Select
                  value={formData.tipologia_materiale_id}
                  onChange={(e) => handleChange('tipologia_materiale_id', e.target.value)}
                  label="Tipologia Materiale *"
                >
                  {tipologie.map((tipologia) => (
                    <MenuItem key={tipologia.id} value={tipologia.id}>
                      {tipologia.nome}
                    </MenuItem>
                  ))}
                </Select>
                {errors.tipologia_materiale_id && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {errors.tipologia_materiale_id}
                  </Alert>
                )}
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 250, flex: 1 }}>
              <TextField
                fullWidth
                label="Quantità (kg) *"
                type="number"
                value={formData.quantita_kg}
                onChange={(e) => handleChange('quantita_kg', parseFloat(e.target.value) || '')}
                error={!!errors.quantita_kg}
                helperText={errors.quantita_kg}
                inputProps={{
                  min: 0,
                  step: 0.01,
                }}
              />
            </Box>
          </Box>

          <Box sx={{ minWidth: 250 }}>
            <FormControl fullWidth>
              <InputLabel>Flusso Origine</InputLabel>
              <Select
                value={formData.flusso_origine_id || ''}
                onChange={(e) => handleChange('flusso_origine_id', e.target.value || '')}
                label="Flusso Origine"
              >
                <MenuItem value="">Nessuno</MenuItem>
                {flussi.map((flusso) => (
                  <MenuItem key={flusso.id} value={flusso.id}>
                    {flusso.nome} ({flusso.codice})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            label="Note"
            multiline
            rows={3}
            value={formData.note}
            onChange={(e) => handleChange('note', e.target.value)}
            placeholder="Note aggiuntive sulla lavorazione..."
          />
        </Box>

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Corrigi gli errori prima di procedere
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onAnnulla}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          Annulla
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? 'Salvataggio...' : 'Salva'}
        </Button>
      </DialogActions>
    </form>
  );
};

export default LavorazioneForm;