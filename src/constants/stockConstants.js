// src/constants/stockConstants.js

export const StockStatusEnum = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  NEAR_TO_EXPIRY: 'near to expiry',
  EXPIRED: 'expired'
};

export const STOCK_STATUS_OPTIONS = [
  { value: StockStatusEnum.AVAILABLE, label: 'Available' },
  { value: StockStatusEnum.RESERVED, label: 'Reserved' },
  { value: StockStatusEnum.NEAR_TO_EXPIRY, label: 'Near to Expiry' },
  { value: StockStatusEnum.EXPIRED, label: 'Expired' }
];

export const getStockStatusColor = (status) => {
  switch (status) {
    case StockStatusEnum.AVAILABLE:
      return 'success';
    case StockStatusEnum.RESERVED:
      return 'warning';
    case StockStatusEnum.NEAR_TO_EXPIRY:
      return 'warning';
    case StockStatusEnum.EXPIRED:
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const getStockStatusBadgeClass = (status) => {
  switch (status) {
    case StockStatusEnum.AVAILABLE:
      return 'bg-green-100 text-green-800 border-green-200';
    case StockStatusEnum.RESERVED:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case StockStatusEnum.NEAR_TO_EXPIRY:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case StockStatusEnum.EXPIRED:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Stock expiry warning thresholds (in days)
export const EXPIRY_THRESHOLDS = {
  CRITICAL: 3,    // Red - Expired or about to expire
  WARNING: 7,     // Yellow - Near to expiry
  NOTICE: 14      // Green - Good condition
};

// Get expiry status based on days left
export const getExpiryStatus = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  
  if (daysLeft <= 0) return 'expired';
  if (daysLeft <= EXPIRY_THRESHOLDS.CRITICAL) return 'critical';
  if (daysLeft <= EXPIRY_THRESHOLDS.WARNING) return 'warning';
  return 'good';
};

// Get color based on expiry status
export const getExpiryColor = (expiryDate) => {
  const status = getExpiryStatus(expiryDate);
  
  switch (status) {
    case 'expired':
    case 'critical':
      return 'text-red-600 bg-red-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'good':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Default pagination for stocks
export const DEFAULT_STOCK_PAGINATION = {
  skip: 0,
  limit: 50
};
