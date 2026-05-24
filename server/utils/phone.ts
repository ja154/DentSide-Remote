const digitsOnly = (value: string) => value.replace(/\D/g, '');

export const normalizeKenyanPhoneNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const digits = digitsOnly(trimmed);

  if (digits.startsWith('254') && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return `+254${digits.slice(1)}`;
  }

  return null;
};

export const toDarajaMsisdn = (value: string) => {
  const normalized = normalizeKenyanPhoneNumber(value);
  return normalized ? normalized.replace(/^\+/, '') : null;
};
