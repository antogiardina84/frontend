// frontend/src/components/forms/TipologieMaterialiForm.tsx
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
  Alert
} from '@mui/material';
import { TipologiaMateriale } from '../../types';

interface TipologiaMaterialeFormData {
  codice: string;
  nome: string;
  descrizione: string;
  cer: string;
  consorzio: string;
  prezzo_medio: number | '';
  attivo: boolean;
}

interface Props {
  open: boolean;
  tipologia_materiale?: TipologiaMateriale;
  onSalva: (data: any) => Promise<void>;
  onAnnulla: () => void;
}

const TipologieMaterialiForm: React.FC<Props> = ({
  open,
  tipologia_materiale,
  onSalva,
  onAnnulla,
}) => {
  const [values, setValues] = useState<TipologiaMaterialeFormData>({
    codice: '',
    nome: '',
    descrizione: '',
    cer: '',
    consorzio: 'COREPLA',
    prezzo_medio: '',
    attivo: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TipologiaMaterialeFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lista consorzi predefiniti
  const consorzi = [
    'COREPLA',
    'COMIECO', 
    'COREVE',
    'CIAL',
    'RICREA',
    'RILEGNO',
    'Altro'
  ];

  // Reset form quando si apre/chiude o cambia la tipologia
  useEffect(() => {
    if (open) {
      if (tipologia_materiale) {
        // Modalità modifica
        setValues({
          codice: tipologia_materiale.codice || '',
          nome: tipologia_materiale.nome || '',
          descrizione: tipologia_materiale.descrizione || '',
          cer: tipologia_materiale.cer || '',
          consorzio: tipologia_materiale.consorzio || 'COREPLA',
          prezzo_medio: tipologia_materiale.prezzo_medio || '',
          attivo: tipologia_materiale.attivo ?? true,
        });
      } else {
        // Modalità creazione - reset ai valori iniziali
        setValues({
          codice: '',
          nome: '',
          descrizione: '',
          cer: '',
          consorzio: 'COREPLA',
          prezzo_medio: '',
          attivo: true,
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open, tipologia_materiale]);

  const handleChange = (field: keyof TipologiaMaterialeFormData, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Rimuovi errore se presente
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TipologiaMaterialeFormData, string>> = {};

    // Validazione codice
    if (!values.codice.trim()) {
      newErrors.codice = 'Il codice è obbligatorio';
    } else if (values.codice.length > 20) {
      newErrors.codice = 'Il codice non può superare i 20 caratteri';
    } else if (!/^[A-Z0-9_-]+$/.test(values.codice.toUpperCase())) {
      newErrors.codice = 'Il codice può contenere solo lettere, numeri, trattini e underscore';
    }

    // Validazione nome
    if (!values.nome.trim()) {
      newErrors.nome = 'Il nome è obbligatorio';
    } else if (values.nome.length > 100) {
      newErrors.nome = 'Il nome non può superare i 100 caratteri';
    }

    // Validazione CER (opzionale ma se presente deve essere valido)
    if (values.cer && values.cer.length > 20) {
      newErrors.cer = 'Il codice CER non può superare i 20 caratteri';
    }

    // Validazione consorzio
    if (values.consorzio && values.consorzio.length > 50) {
      newErrors.consorzio = 'Il consorzio non può superare i 50 caratteri';
    }

    // Validazione prezzo medio
    if (values.prezzo_medio !== '' && 
        (isNaN(Number(values.prezzo_medio)) || Number(values.prezzo_medio) < 0)) {
      newErrors.prezzo_medio = 'Il prezzo medio deve essere un numero non negativo';
    }

    // Validazione descrizione
    if (values.descrizione && values.descrizione.length > 1000) {
      newErrors.descrizione = 'La descrizione non può superare i 1000 caratteri';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepara i dati da inviare, rimuovendo i campi vuoti
      const dataToSubmit: any = {
        codice: values.codice.toUpperCase().trim(),
        nome: values.nome.trim(),
        attivo: values.attivo
      };

      // Aggiungi solo i campi opzionali che hanno un valore
      if (values.descrizione?.trim()) {
        dataToSubmit.descrizione = values.descrizione.trim();
      }
      
      if (values.cer?.trim()) {
        dataToSubmit.cer = values.cer.trim();
      }
      
      if (values.consorzio?.trim()) {
        dataToSubmit.consorzio = values.consorzio.trim();
      }
      
      if (values.prezzo_medio !== '' && values.prezzo_medio !== undefined) {
        dataToSubmit.prezzo_medio = Number(values.prezzo_medio);
      }

      console.log('Dati che sto per inviare:', dataToSubmit);
      
      await onSalva(dataToSubmit);
      
      // Se arriviamo qui, il salvataggio è andato a buon fine
      // Il componente padre si occuperà di chiudere il dialog
      
    } catch (error) {
      console.error("Errore nel salvataggio della tipologia materiale:", error);
      // L'errore viene gestito dal componente padre
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onAnnulla();
    }
  };

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
              {tipologia_materiale ? 'Modifica Tipologia Materiale' : 'Nuova Tipologia Materiale'}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            
            {/* Prima riga - Codice e Nome */}
            <Box sx={{ display: 'flex', gap: 2, '& > *': { flex: 1 } }}>
              <TextField
                label="Codice *"
                value={values.codice}
                onChange={(e) => handleChange('codice', e.target.value)}
                error={!!errors.codice}
                helperText={errors.codice || 'Es: PET-BOT, HDPE-FLA'}
                disabled={isSubmitting}
                inputProps={{ 
                  maxLength: 20,
                  style: { textTransform: 'uppercase' }
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

            {/* Seconda riga - CER e Consorzio */}
            <Box sx={{ display: 'flex', gap: 2, '& > *': { flex: 1 } }}>
              <TextField
                label="Codice CER"
                value={values.cer}
                onChange={(e) => handleChange('cer', e.target.value)}
                error={!!errors.cer}
                helperText={errors.cer || 'Es: 150102'}
                disabled={isSubmitting}
                inputProps={{ maxLength: 20 }}
              />

              <FormControl error={!!errors.consorzio} disabled={isSubmitting}>
                <InputLabel>Consorzio</InputLabel>
                <Select
                  value={values.consorzio}
                  onChange={(e) => handleChange('consorzio', e.target.value)}
                  label="Consorzio"
                >
                  {consorzi.map((consorzio) => (
                    <MenuItem key={consorzio} value={consorzio}>
                      {consorzio}
                    </MenuItem>
                  ))}
                </Select>
                {errors.consorzio && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.consorzio}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Terza riga - Prezzo Medio */}
            <TextField
              label="Prezzo Medio (€/t)"
              type="number"
              value={values.prezzo_medio}
              onChange={(e) => handleChange('prezzo_medio', parseFloat(e.target.value) || '')}
              error={!!errors.prezzo_medio}
              helperText={errors.prezzo_medio || 'Prezzo indicativo per tonnellata'}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: <InputAdornment position="end">€/t</InputAdornment>,
                inputProps: { min: 0, step: 0.01 }
              }}
            />

            {/* Descrizione - Full width */}
            <TextField
              fullWidth
              label="Descrizione"
              multiline
              rows={3}
              value={values.descrizione}
              onChange={(e) => handleChange('descrizione', e.target.value)}
              error={!!errors.descrizione}
              helperText={errors.descrizione || `${values.descrizione.length}/1000 caratteri`}
              placeholder="Descrizione dettagliata del materiale..."
              disabled={isSubmitting}
              inputProps={{ maxLength: 1000 }}
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
                      Tipologia attiva
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Le tipologie disattive non saranno disponibili nei nuovi inserimenti
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

export default TipologieMaterialiForm;