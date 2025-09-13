// frontend/src/pages/Ingressi/IngressoForm.tsx
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
  Stack,
} from '@mui/material';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Ingresso, Comune, TipologiaMateriale, FlussoCorepla, IngressoFormData } from '../../types';
import { IngressiService } from '../../services/IngressiService';
import { useForm } from '../../hooks/useForm';
import { useNotifiche } from '../../contexts/NotificheContext';
import { required, isNumber, minValue } from '../../utils/validation';

interface IngressoFormProps {
  ingresso: Ingresso | null;
  comuni: Comune[];
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

const IngressoForm: React.FC<IngressoFormProps> = ({
  ingresso,
  comuni,
  tipologie,
  flussi,
  onSalva,
  onAnnulla,
}) => {
  const { aggiungiNotifica } = useNotifiche();

  const initialValues: IngressoFormData = {
    data_conferimento: ingresso?.data_conferimento || new Date().toISOString().split('T')[0],
    numero_formulario: ingresso?.numero_formulario || '',
    data_formulario: ingresso?.data_formulario || '',
    comune_id: ingresso?.comune_id || '',
    tipologia_materiale_id: ingresso?.tipologia_materiale_id || '',
    quantita_kg: ingresso?.quantita_kg || '',
    flusso_id: ingresso?.flusso_id || '',
    note: ingresso?.note || '',
  };

  const validate = (values: IngressoFormData) => {
    const errors: Partial<Record<keyof IngressoFormData, string>> = {};

    const dataError = required(values.data_conferimento);
    if (dataError) errors.data_conferimento = dataError;

    const comuneError = required(values.comune_id);
    if (comuneError) errors.comune_id = comuneError;

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

    return errors;
  };

  const handleSubmit = async (values: IngressoFormData) => {
    try {
      const data = {
        ...values,
        comune_id: Number(values.comune_id),
        tipologia_materiale_id: Number(values.tipologia_materiale_id),
        quantita_kg: Number(values.quantita_kg),
        flusso_id: values.flusso_id ? Number(values.flusso_id) : undefined,
      };

      if (ingresso) {
        await IngressiService.updateIngresso(ingresso.id, data);
      } else {
        await IngressiService.createIngresso(data);
      }

      onSalva();
    } catch (error: any) {
      console.error('Errore salvataggio ingresso:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: error.response?.data?.message || 'Errore nel salvataggio dell\'ingresso',
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

  return (
    <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <DialogTitle>
        {ingresso ? 'Modifica Ingresso' : 'Nuovo Ingresso'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Prima riga - Data Conferimento e Numero Formulario */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              '& > *': { minWidth: 250, flex: 1 }
            }}
          >
            <DatePicker
              label="Data Conferimento"
              value={parseDate(values.data_conferimento)} // FIX: Usa parseDate
              onChange={(date) => handleChange('data_conferimento', formatDateForInput(date))} // FIX: Usa formatDateForInput
              slotProps={{
                textField: {
                  error: !!errors.data_conferimento,
                  helperText: errors.data_conferimento,
                }
              }}
            />

            <TextField
              label="Numero Formulario"
              value={values.numero_formulario}
              onChange={(e) => handleChange('numero_formulario', e.target.value)}
              error={!!errors.numero_formulario}
              helperText={errors.numero_formulario}
            />
          </Box>

          {/* Seconda riga - Comune e Tipologia Materiale */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              '& > *': { minWidth: 250, flex: 1 }
            }}
          >
            <FormControl error={!!errors.comune_id}>
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

            <FormControl error={!!errors.tipologia_materiale_id}>
              <InputLabel>Tipologia Materiale</InputLabel>
              <Select
                value={values.tipologia_materiale_id}
                onChange={(e) => handleChange('tipologia_materiale_id', e.target.value)}
                label="Tipologia Materiale"
              >
                {tipologie.map((tipologia) => (
                  <MenuItem key={tipologia.id} value={tipologia.id}>
                    {tipologia.nome} ({tipologia.codice})
                  </MenuItem>
                ))}
              </Select>
              {errors.tipologia_materiale_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.tipologia_materiale_id}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* Terza riga - Quantità e Flusso COREPLA */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              '& > *': { minWidth: 250, flex: 1 }
            }}
          >
            <TextField
              label="Quantità (kg)"
              type="number"
              value={values.quantita_kg}
              onChange={(e) => handleChange('quantita_kg', e.target.value)}
              error={!!errors.quantita_kg}
              helperText={errors.quantita_kg}
              inputProps={{ min: 0, step: 0.1 }}
            />

            <FormControl>
              <InputLabel>Flusso COREPLA</InputLabel>
              <Select
                value={values.flusso_id}
                onChange={(e) => handleChange('flusso_id', e.target.value)}
                label="Flusso COREPLA"
              >
                <MenuItem value="">Nessuno</MenuItem>
                {flussi.map((flusso) => (
                  <MenuItem key={flusso.id} value={flusso.id}>
                    Flusso {flusso.codice} - {flusso.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Quarta riga - Data Formulario */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              '& > *': { minWidth: 250, flex: 1 }
            }}
          >
            <DatePicker
              label="Data Formulario"
              value={parseDate(values.data_formulario)} // FIX: Usa parseDate
              onChange={(date) => handleChange('data_formulario', formatDateForInput(date))} // FIX: Usa formatDateForInput
            />
            {/* Spazio vuoto per allineamento */}
            <Box />
          </Box>

          {/* Note - Full width */}
          <TextField
            fullWidth
            label="Note"
            multiline
            rows={3}
            value={values.note}
            onChange={(e) => handleChange('note', e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onAnnulla}>
          Annulla
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvataggio...' : 'Salva'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default IngressoForm;