// frontend/src/components/Common/SafeDatePicker.tsx
import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

interface SafeDatePickerProps {
  label: string;
  value: string | Date | Dayjs | null;
  onChange: (value: string | null) => void;
  required?: boolean;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  format?: string;
  maxDate?: Dayjs;
  minDate?: Dayjs;
}

const SafeDatePicker: React.FC<SafeDatePickerProps> = ({
  label,
  value,
  onChange,
  required = false,
  fullWidth = true,
  error = false,
  helperText,
  disabled = false,
  format = 'DD/MM/YYYY',
  maxDate,
  minDate,
}) => {
  // Converte sempre il valore in oggetto dayjs valido
  const getDayjsValue = (): Dayjs | null => {
    if (!value) return null;
    
    try {
      if (dayjs.isDayjs(value)) {
        return value.isValid() ? value : null;
      }
      
      const dayjsValue = dayjs(value);
      return dayjsValue.isValid() ? dayjsValue : null;
    } catch (error) {
      console.warn('Errore conversione data:', error);
      return null;
    }
  };

  const handleChange = (newValue: Dayjs | null) => {
    try {
      if (!newValue) {
        onChange(null);
        return;
      }
      
      if (dayjs.isDayjs(newValue) && newValue.isValid()) {
        onChange(newValue.format('YYYY-MM-DD'));
      } else {
        onChange(null);
      }
    } catch (error) {
      console.warn('Errore gestione cambio data:', error);
      onChange(null);
    }
  };

  const renderDatePicker = () => (
    <DatePicker
      label={label}
      value={getDayjsValue()}
      onChange={handleChange}
      format={format}
      maxDate={maxDate}
      minDate={minDate}
      disabled={disabled}
      slotProps={{
        textField: {
          required,
          fullWidth,
          error,
          helperText,
          variant: 'outlined'
        }
      }}
    />
  );

  const renderFallbackTextField = () => (
    <TextField
      label={label}
      type="date"
      value={value ? dayjs(value).format('YYYY-MM-DD') : ''}
      onChange={(e) => onChange(e.target.value || null)}
      required={required}
      fullWidth={fullWidth}
      error={error}
      helperText={helperText || 'Utilizzando input di backup per compatibilità'}
      disabled={disabled}
      InputLabelProps={{
        shrink: true,
      }}
    />
  );

  // Prova a renderizzare DatePicker, fallback su TextField nativo se errore
  try {
    return renderDatePicker();
  } catch (error) {
    console.warn('Errore DatePicker, usando fallback:', error);
    return renderFallbackTextField();
  }
};

export default SafeDatePicker;