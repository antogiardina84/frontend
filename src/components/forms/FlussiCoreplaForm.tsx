// frontend/src/components/forms/FlussiCoreplaForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Switch,
  Stack,
  Box,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Chip
} from '@mui/material';
import { FlussoCorepla } from '../../types';

interface FlussiCoreplaFormData {
  codice: string;
  nome: string;
  descrizione: string;
  corrispettivo_unitario: number | '';
  limite_traccianti: number | '';
  limite_frazione_estranea: number | '';
  limite_cpl: number | '';
  attivo: boolean;
}

interface Props {
  open: boolean;
  flusso?: FlussoCorepla;
  onSalva: (data: any) => Promise<void>;
  onAnnulla: () => void;
}

const FlussiCoreplaForm: React.FC<Props> = ({
  open,
  flusso,
  onSalva,
  onAnnulla
}) => {
  const [values, setValues] = useState<FlussiCoreplaFormData>({
    codice: '',
    nome: '',
    descrizione: '',
    corrispettivo_unitario: '',
    limite_traccianti: '',
    limite_frazione_estranea: '',
    limite_cpl: '',
    attivo: true
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FlussiCoreplaFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flussi COREPLA standard con corrispettivi indicativi (2024)
  const flussiPredefiniti = [
    { 
      codice: 'A', 
      nome: 'Raccolta monomateriale plastica', 
      descrizione: 'Raccolta dedicata solo agli imballaggi in plastica',
      corrispettivo_unitario: 280.00,
      limite_traccianti: 3.0,
      limite_frazione_estranea: 20.0,
      limite_cpl: 85.0
    },
    { 
      codice: 'B', 
      nome: 'Raccolta multimateriale leggero', 
      descrizione: 'Raccolta congiunta di imballaggi in plastica, alluminio e acciaio',
      corrispettivo_unitario: 140.00,
      limite_traccianti: 2.0,
      limite_frazione_estranea: 30.0,
      limite_cpl: 70.0
    },
    { 
      codice: 'C', 
      nome: 'Cernita da indifferenziato', 
      descrizione: 'Materiale selezionato da raccolta indifferenziata',
      corrispettivo_unitario: 100.00,
      limite_traccianti: 1.5,
      limite_frazione_estranea: 40.0,
      limite_cpl: 60.0
    },
    { 
      codice: 'D', 
      nome: 'Raccolta multimateriale pesante', 
      descrizione: 'Raccolta congiunta con vetro e altri materiali',
      corrispettivo_unitario: 80.00,
      limite_traccianti: 1.0,
      limite_frazione_estranea: 50.0,
      limite_cpl: 50.0
    }
  ];

  // Reset form quando si apre/chiude o cambia il flusso
  useEffect(() => {
    if (open) {
      if (flusso) {
        // Modalità modifica
        setValues({
          codice: flusso.codice || '',
          nome: flusso.nome || '',
          descrizione: flusso.descrizione || '',
          corrispettivo_unitario: flusso.corrispettivo_unitario || '',
          limite_traccianti: flusso.limite_traccianti || '',
          limite_frazione_estranea: flusso.limite_frazione_estranea || '',
          limite_cpl: flusso.limite_cpl || '',
          attivo: flusso.attivo ?? true
        });
      } else {
        // Modalità creazione - reset ai valori iniziali
        setValues({
          codice: '',
          nome: '',
          descrizione: '',
          corrispettivo_unitario: '',
          limite_traccianti: '',
          limite_frazione_estranea: '',
          limite_cpl: '',
          attivo: true
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open, flusso]);

  const handleChange = (field: keyof FlussiCoreplaFormData, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Rimuovi errore se presente
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FlussiCoreplaFormData, string>> = {};

    // Validazione codice
    if (!values.codice.trim()) {
      newErrors.codice = 'Il codice è obbligatorio';
    } else if (!['A', 'B', 'C', 'D'].includes(values.codice.toUpperCase())) {
      newErrors.codice = 'Il codice deve essere A, B, C o D';
    }

    // Validazione nome
    if (!values.nome.trim()) {
      newErrors.nome = 'Il nome è obbligatorio';
    } else if (values.nome.length > 100) {
      newErrors.nome = 'Il nome non può superare i 100 caratteri';
    }

    // Validazione corrispettivo unitario
    if (!values.corrispettivo_unitario || values.corrispettivo_unitario <= 0) {
      newErrors.corrispettivo_unitario = 'Il corrispettivo unitario è obbligatorio e deve essere maggiore di 0';
    } else if (values.corrispettivo_unitario > 1000) {
      newErrors.corrispettivo_unitario = 'Il corrispettivo sembra troppo alto (max 1000 €/t)';
    }

    // Validazione percentuali (0-100)
    const percentuali = ['limite_traccianti', 'limite_frazione_estranea', 'limite_cpl'] as const;
    percentuali.forEach(campo => {
      const valore = values[campo];
      if (valore !== '' && typeof valore === 'number' && (valore < 0 || valore > 100)) {
        newErrors[campo] = 'Il valore deve essere compreso tra 0 e 100';
      }
    });

    // Validazione descrizione
    if (values.descrizione && values.descrizione.length > 500) {
      newErrors.descrizione = 'La descrizione non può superare i 500 caratteri';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Prepara i dati da inviare
      const dataToSubmit: any = {
        codice: values.codice.toUpperCase().trim(),
        nome: values.nome.trim(),
        corrispettivo_unitario: Number(values.corrispettivo_unitario),
        attivo: values.attivo
      };

      // Aggiungi solo i campi opzionali che hanno un valore
      if (values.descrizione?.trim()) {
        dataToSubmit.descrizione = values.descrizione.trim();
      }

      if (values.limite_traccianti !== '' && values.limite_traccianti !== undefined) {
        dataToSubmit.limite_traccianti = Number(values.limite_traccianti);
      }

      if (values.limite_frazione_estranea !== '' && values.limite_frazione_estranea !== undefined) {
        dataToSubmit.limite_frazione_estranea = Number(values.limite_frazione_estranea);
      }

      if (values.limite_cpl !== '' && values.limite_cpl !== undefined) {
        dataToSubmit.limite_cpl = Number(values.limite_cpl);
      }

      console.log('Dati flusso che sto per inviare:', dataToSubmit);
      
      await onSalva(dataToSubmit);
      
    } catch (error) {
      console.error('Errore nel salvataggio del flusso:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePredefinitoChange = (codiceFlusso: string) => {
    const flusso = flussiPredefiniti.find(f => f.codice === codiceFlusso);
    if (flusso) {
      setValues(prev => ({
        ...prev,
        codice: flusso.codice,
        nome: flusso.nome,
        descrizione: flusso.descrizione,
        corrispettivo_unitario: flusso.corrispettivo_unitario,
        limite_traccianti: flusso.limite_traccianti,
        limite_frazione_estranea: flusso.limite_frazione_estranea,
        limite_cpl: flusso.limite_cpl
      }));
      // Pulisci eventuali errori
      setErrors({});
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onAnnulla();
    }
  };

  const selectedTemplate = flussiPredefiniti.find(f => f.codice === values.codice);

  return (
    <Dialog 
      open={open} 
      maxWidth="md" 
      fullWidth 
      onClose={handleClose}
      disableEscapeKeyDown={isSubmitting}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">
              {flusso ? 'Modifica Flusso COREPLA' : 'Nuovo Flusso COREPLA'}
            </Typography>
            {values.codice && (
              <Chip 
                label={`Flusso ${values.codice}`} 
                color="primary" 
                size="small" 
              />
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            
            {/* Selezione template predefinito */}
            <Alert severity="info" sx={{ mb: 2 }}>
              I flussi COREPLA seguono standard specifici. Usa i template predefiniti per configurazioni corrette.
            </Alert>

            <FormControl disabled={isSubmitting}>
              <InputLabel>Template Flusso COREPLA</InputLabel>
              <Select
                value=""
                onChange={(e) => handlePredefinitoChange(e.target.value as string)}
                label="Template Flusso COREPLA"
              >
                <MenuItem value="">Configurazione personalizzata</MenuItem>
                {flussiPredefiniti.map((f) => (
                  <MenuItem key={f.codice} value={f.codice}>
                    <Box>
                      <Typography variant="body2">
                        <strong>Flusso {f.codice}</strong> - {f.nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {f.corrispettivo_unitario} €/t
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Prima riga - Codice e Nome */}
            <Box sx={{ display: 'flex', gap: 2, '& > *': { flex: 1 } }}>
              <TextField
                label="Codice Flusso *"
                value={values.codice}
                onChange={(e) => handleChange('codice', e.target.value.toUpperCase())}
                error={!!errors.codice}
                helperText={errors.codice || 'Solo A, B, C o D'}
                disabled={isSubmitting}
                inputProps={{ 
                  maxLength: 1,
                  style: { textTransform: 'uppercase', textAlign: 'center', fontSize: '1.2em' }
                }}
              />
              
              <TextField
                label="Nome *"
                value={values.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                error={!!errors.nome}
                helperText={errors.nome}
                disabled={isSubmitting}
                inputProps={{ maxLength: 100 }}
              />
            </Box>

            {/* Seconda riga - Corrispettivo */}
            <TextField
              label="Corrispettivo Unitario (€/t) *"
              type="number"
              value={values.corrispettivo_unitario}
              onChange={(e) => handleChange('corrispettivo_unitario', parseFloat(e.target.value) || '')}
              error={!!errors.corrispettivo_unitario}
              helperText={errors.corrispettivo_unitario || 'Corrispettivo riconosciuto da COREPLA'}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: <InputAdornment position="end">€/t</InputAdornment>,
                inputProps: { min: 0, max: 1000, step: 0.01 }
              }}
            />

            {/* Sezione Limiti Qualitativi */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Limiti Qualitativi (%)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Percentuali massime consentite secondo le specifiche COREPLA
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, '& > *': { flex: 1 } }}>
                <TextField
                  label="Limite Traccianti"
                  type="number"
                  value={values.limite_traccianti}
                  onChange={(e) => handleChange('limite_traccianti', parseFloat(e.target.value) || '')}
                  error={!!errors.limite_traccianti}
                  helperText={errors.limite_traccianti || 'Max consentito'}
                  disabled={isSubmitting}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100, step: 0.1 }
                  }}
                />

                <TextField
                  label="Limite Frazione Estranea"
                  type="number"
                  value={values.limite_frazione_estranea}
                  onChange={(e) => handleChange('limite_frazione_estranea', parseFloat(e.target.value) || '')}
                  error={!!errors.limite_frazione_estranea}
                  helperText={errors.limite_frazione_estranea || 'Max consentito'}
                  disabled={isSubmitting}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100, step: 0.1 }
                  }}
                />

                <TextField
                  label="Limite CPL"
                  type="number"
                  value={values.limite_cpl}
                  onChange={(e) => handleChange('limite_cpl', parseFloat(e.target.value) || '')}
                  error={!!errors.limite_cpl}
                  helperText={errors.limite_cpl || 'Min richiesto'}
                  disabled={isSubmitting}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100, step: 0.1 }
                  }}
                />
              </Box>
            </Box>

            {/* Template info */}
            {selectedTemplate && (
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Template {selectedTemplate.codice}</strong>: {selectedTemplate.descrizione}
                </Typography>
              </Alert>
            )}

            {/* Descrizione - Full width */}
            <TextField
              fullWidth
              label="Descrizione"
              multiline
              rows={3}
              value={values.descrizione}
              onChange={(e) => handleChange('descrizione', e.target.value)}
              error={!!errors.descrizione}
              helperText={errors.descrizione || `${values.descrizione.length}/500 caratteri`}
              placeholder="Descrizione dettagliata del flusso di raccolta..."
              disabled={isSubmitting}
              inputProps={{ maxLength: 500 }}
            />

            {/* Switch Attivo */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={values.attivo}
                    onChange={(e) => handleChange('attivo', e.target.checked)}
                    disabled={isSubmitting}
                  />
                }
                label={
                  <Box>
                    <Typography component="span">
                      Flusso attivo
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      I flussi disattivi non saranno disponibili per nuovi conferimenti
                    </Typography>
                  </Box>
                }
              />
            </Box>

          </Stack>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleClose}
            disabled={isSubmitting}
          >
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
      </form>
    </Dialog>
  );
};

export default FlussiCoreplaForm;