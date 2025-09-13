// frontend/src/utils/validation.ts
export const required = (value: any): string | undefined => {
  if (value === null || value === undefined || value === '') {
    return 'Campo obbligatorio';
  }
  return undefined;
};

export const minLength = (min: number) => (value: string): string | undefined => {
  if (value && value.length < min) {
    return `Minimo ${min} caratteri`;
  }
  return undefined;
};

export const maxLength = (max: number) => (value: string): string | undefined => {
  if (value && value.length > max) {
    return `Massimo ${max} caratteri`;
  }
  return undefined;
};

export const isNumber = (value: any): string | undefined => {
  if (value !== '' && isNaN(Number(value))) {
    return 'Deve essere un numero';
  }
  return undefined;
};

export const minValue = (min: number) => (value: number): string | undefined => {
  if (value < min) {
    return `Valore minimo: ${min}`;
  }
  return undefined;
};

export const maxValue = (max: number) => (value: number): string | undefined => {
  if (value > max) {
    return `Valore massimo: ${max}`;
  }
  return undefined;
};

export const isPercentage = (value: number): string | undefined => {
  if (value < 0 || value > 100) {
    return 'Deve essere tra 0 e 100';
  }
  return undefined;
};