export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number, total: number) => {
  if (total === 0) return '0.0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};
