import { supabaseConfig } from './runtime-config';

const digitsOnly = (value: string) => value.replace(/\D/g, '');

export const normalizeKenyanPhoneNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const digits = digitsOnly(trimmed);
  const countryCode = digitsOnly(supabaseConfig.defaultCountryCode || '254') || '254';

  if (digits.startsWith(countryCode) && digits.length === countryCode.length + 9) {
    return `+${digits}`;
  }

  if (digits.startsWith(`0`) && digits.length === 10) {
    return `+${countryCode}${digits.slice(1)}`;
  }

  return null;
};

export const toDarajaPhoneNumber = (value: string) => {
  const normalized = normalizeKenyanPhoneNumber(value);
  return normalized ? normalized.replace(/^\+/, '') : null;
};
