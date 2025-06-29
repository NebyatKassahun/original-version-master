export const formatCurrency = (amount, currency = 'ETB') => {
  return `${amount.toLocaleString()} ${currency}`;
};

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (num) => {
  return num.toLocaleString();
};

export const getStockStatus = (stock) => {
  if (stock === 0) return 'out';
  if (stock <= 10) return 'low';
  if (stock <= 30) return 'medium';
  return 'high';
};

export const getStockStatusColor = (status) => {
  switch (status) {
    case 'high': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-orange-100 text-orange-800';
    case 'out': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};