/**
 * CSV Export Utility Functions
 * Provides functions to export data to CSV format
 */

/**
 * Convert data to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header objects with key and label properties
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (data, headers) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Create header row
  const headerRow = headers.map(header => `"${header.label}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return headers.map(header => {
      const value = item[header.key];
      // Handle nested objects and arrays
      let displayValue = '';
      if (value === null || value === undefined) {
        displayValue = '';
      } else if (typeof value === 'object') {
        displayValue = JSON.stringify(value);
      } else {
        displayValue = String(value);
      }
      // Escape quotes and wrap in quotes
      return `"${displayValue.replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV content as string
 * @param {string} filename - Name of the file to download
 */
export const downloadCSV = (csvContent, filename) => {
  if (!csvContent) {
    console.error('No CSV content provided');
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header objects with key and label properties
 * @param {string} filename - Name of the file to download
 */
export const exportToCSV = (data, headers, filename) => {
  try {
    const csvContent = convertToCSV(data, headers);
    downloadCSV(csvContent, filename);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export CSV file');
  }
};

/**
 * Format date for CSV export
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateForCSV = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format currency for CSV export
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'ETB')
 * @returns {string} Formatted currency string
 */
export const formatCurrencyForCSV = (amount, currency = 'ETB') => {
  if (amount === null || amount === undefined) return '';
  return `${Number(amount).toFixed(2)} ${currency}`;
};

/**
 * Predefined headers for common data types
 */
export const CSV_HEADERS = {
  SALES: [
    { key: 'saleId', label: 'Sale ID' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'customerEmail', label: 'Customer Email' },
    { key: 'totalQuantity', label: 'Total Quantity' },
    { key: 'totalRevenue', label: 'Total Revenue (ETB)' },
    { key: 'createdBy', label: 'Created By' },
    { key: 'createdAt', label: 'Date' }
  ],
  PRODUCTS: [
    { key: 'productId', label: 'Product ID' },
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    { key: 'salePrice', label: 'Sale Price (ETB)' },
    { key: 'purchasePrice', label: 'Purchase Price (ETB)' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'description', label: 'Description' }
  ],
  PURCHASES: [
    { key: 'purchaseId', label: 'Purchase ID' },
    { key: 'supplierName', label: 'Supplier Name' },
    { key: 'totalQuantity', label: 'Total Quantity' },
    { key: 'totalSpent', label: 'Total Spent (ETB)' },
    { key: 'createdAt', label: 'Date' }
  ],
  CUSTOMERS: [
    { key: 'customerId', label: 'Customer ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' }
  ]
}; 