// frontend/src/pages/Costi/CostoForm.tsx
import React from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
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

import { Costo, TipologiaMateriale, CostoFormData, CATEGORIE_COSTO } from '../../types';
import { CostiService } from '../../services/CostiService';
import { useForm } from '../../hooks/useForm';
import { useNotifiche } from '../../contexts/NotificheContext';
import { required, isNumber, minValue } from '../../utils/validation';

interface CostoFormProps {
  costo: Costo | null;
  tipologie: TipologiaMateriale[];
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

const CostoForm: React.FC<CostoFormProps> = ({
  costo,
  tipologie,
  onSalva,
  onAnnulla,
}) => {
  const { aggiungiNotifica } = useNotifiche();

  const initialValues: CostoFormData = {
    data_costo: costo?.data_costo || new Date().toISOString().split('T')[0],
    categoria: costo?.categoria || '',
    descrizione: costo?.descrizione || '',
    importo: costo?.importo || '',
    tipologia_materiale_id: costo?.tipologia_materiale_id || '',
    fornitore: costo?.fornitore || '',
    numero_documento: costo?.numero_documento || '',
    note: costo?.note || '',
  };

  const validate = (values: CostoFormData) => {
    const errors: Partial<Record<keyof CostoFormData, string>> = {};

    // Data costo obbligatoria
    const dataError = required(values.data_costo);
    if (dataError) errors.data_costo = dataError;

    // Categoria obbligatoria
    const categoriaError = required(values.categoria);
    if (categoriaError) errors.categoria = categoriaError;

    // Descrizione obbligatoria
    const descrizioneError = required(values.descrizione);
    if (descrizioneError) errors.descrizione = descrizioneError;

    // Importo obbligatorio e validazione numerica
    const importoRequiredError = required(values.importo);
    if (importoRequiredError) {
      errors.importo = importoRequiredError;
    } else {
      const importoNumberError = isNumber(values.importo);
      if (importoNumberError) {
        errors.importo = importoNumberError;
      } else {
        const importoMinError = minValue(0.01)(Number(values.importo));
        if (importoMinError) errors.importo = importoMinError;
      }
    }

    return errors;
  };

  const handleSubmit = async (values: CostoFormData) => {
    try {
      const data = {
        ...values,
        importo: Number(values.importo),
        tipologia_materiale_id: values.tipologia_materiale_id ? Number(values.tipologia_materiale_id) : undefined,
      };

      if (costo) {
        // Modifica costo esistente
        await CostiService.updateCosto(costo.id, data);
      } else {
        // Crea nuovo costo
        await CostiService.createCosto(data);
      }

      onSalva();
    } catch (error: any) {
      console.error('Errore salvataggio costo:', error);
      aggiungiNotifica({
        tipo: 'error',
        titolo: 'Errore',
        messaggio: error.response?.data?.message || 'Errore nel salvataggio del costo',
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
    <>
      <DialogTitle>
        {costo ? 'Modifica Costo' : 'Nuovo Costo'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Data Costo */}
           <Grid component="div" item xs={12} sm={6} md={2}>
              <DatePicker
                label="Data Costo"
                value={parseDate(values.data_costo)} // FIX: Usa parseDate
                onChange={(date) => handleChange('data_costo', formatDateForInput(date))} // FIX: Usa formatDateForInput
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.data_costo,
                    helperText: errors.data_costo,
                  }
                }}
              />
            </Grid>

            {/* Categoria */}
           <Grid component="div" item xs={12} sm={6} md={2}>
              <FormControl fullWidth error={!!errors.categoria}>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={values.categoria}
                  onChange={(e) => handleChange('categoria', e.target.value)}
                  label="Categoria"
                >
                  {CATEGORIE_COSTO.map((categoria) => (
                    <MenuItem key={categoria} value={categoria}>
                      {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoria && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.categoria}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Descrizione */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrizione"
                value={values.descrizione}
                onChange={(e) => handleChange('descrizione', e.target.value)}
                error={!!errors.descrizione}
                helperText={errors.descrizione}
                multiline
                rows={2}
                placeholder="Descrizione dettagliata del costo..."
              />
            </Grid>

            {/* Importo */}
           <Grid component="div" item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Importo (€)"
                type="number"
                value={values.importo}
                onChange={(e) => handleChange('importo', e.target.value)}
                error={!!errors.importo}
                helperText={errors.importo}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Tipologia Materiale (opzionale) */}
           <Grid component="div" item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Tipologia Materiale</InputLabel>
                <Select
                  value={values.tipologia_materiale_id || ''}
                  onChange={(e) => handleChange('tipologia_materiale_id', e.target.value || '')}
                  label="Tipologia Materiale"
                >
                  <MenuItem value="">Nessuna</MenuItem>
                  {tipologie.map((tipologia) => (
                    <MenuItem key={tipologia.id} value={tipologia.id}>
                      {tipologia.nome} ({tipologia.codice})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Fornitore */}
           <Grid component="div" item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Fornitore"
                value={values.fornitore}
                onChange={(e) => handleChange('fornitore', e.target.value)}
                placeholder="Nome fornitore o azienda"
              />
            </Grid>

            {/* Numero Documento */}
           <Grid component="div" item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Numero Documento"
                value={values.numero_documento}
                onChange={(e) => handleChange('numero_documento', e.target.value)}
                placeholder="Numero fattura, ricevuta, ecc."
              />
            </Grid>

            {/* Note */}
            <Grid component="div" item xs={12}>
              <TextField
                fullWidth
                label="Note"
                value={values.note}
                onChange={(e) => handleChange('note', e.target.value)}
                multiline
                rows={3}
                placeholder="Note aggiuntive sul costo..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onAnnulla} disabled={isSubmitting}>
          Annulla
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvataggio...' : (costo ? 'Aggiorna' : 'Crea')}
        </Button>
      </DialogActions>
    </>
  );
};

export default CostoForm;