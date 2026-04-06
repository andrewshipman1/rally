import { CURRENCY_SYMBOL } from './constants';

export function formatMoney(amount: number | null | undefined, suffix = ''): string {
  if (amount == null || isNaN(amount)) return '—';
  const rounded = Math.round(amount);
  return `${CURRENCY_SYMBOL}${rounded.toLocaleString('en-US')}${suffix}`;
}
