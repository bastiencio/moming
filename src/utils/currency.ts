
export type SupportedCurrency = 'CNY' | 'USD';

export const formatCurrency = (amount: number, currency: SupportedCurrency) => {
  const locale = currency === 'CNY' ? 'zh-CN' : 'en-US';
  const code = currency === 'CNY' ? 'CNY' : 'USD';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(amount || 0);
};

export const convertToCNY = (amount: number, currency: SupportedCurrency, fxToCny: number) => {
  if (!amount) return 0;
  if (currency === 'CNY') return amount;
  const fx = Number.isFinite(fxToCny) && fxToCny > 0 ? fxToCny : 1;
  return amount * fx;
};
