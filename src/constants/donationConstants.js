// src/constants/donationConstants.js

export const ScreeningResultEnum = {
  SAFE: 'safe',
  UNSAFE: 'unsafe',
  PENDING: 'pending'
};

export const StockStatusEnum = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  USED: 'used',
  EXPIRED: 'expired'
};

export const CollectionSiteEnum = {
  LAQUINTINIE: 'Laquintinie',
  DISTRICT: 'District',
  GENERAL: 'Douala General',
  UNKNOWN: 'Unknown'
};

export const SCREENING_RESULT_OPTIONS = [
  { value: ScreeningResultEnum.SAFE, label: 'Safe' },
  { value: ScreeningResultEnum.UNSAFE, label: 'Unsafe' },
  { value: ScreeningResultEnum.PENDING, label: 'Pending' }
];

export const STOCK_STATUS_OPTIONS = [
  { value: StockStatusEnum.AVAILABLE, label: 'Available' },
  { value: StockStatusEnum.RESERVED, label: 'Reserved' },
  { value: StockStatusEnum.USED, label: 'Used' },
  { value: StockStatusEnum.EXPIRED, label: 'Expired' }
];

export const COLLECTION_SITE_OPTIONS = [
  { value: CollectionSiteEnum.LAQUINTINIE, label: 'Laquintinie' },
  { value: CollectionSiteEnum.DISTRICT, label: 'District' },
  { value: CollectionSiteEnum.GENERAL, label: 'Douala General' },
  { value: CollectionSiteEnum.UNKNOWN, label: 'Unknown' }
];

// Hemoglobin constraints
export const HEMOGLOBIN_CONSTRAINTS = {
  MIN_SAFE: 12.5,
  MIN_VALUE: 0,
  MAX_VALUE: 20
};

// Volume constraints (typical blood donation volumes)
export const VOLUME_CONSTRAINTS = {
  MIN: 200,
  MAX: 500,
  STANDARD: 450
};

// Default pagination for donations
export const DEFAULT_DONATION_PAGINATION = {
  skip: 0,
  limit: 20
};

// Helper functions
export const getScreeningResultColor = (result) => {
  switch (result) {
    case ScreeningResultEnum.SAFE:
      return 'success';
    case ScreeningResultEnum.UNSAFE:
      return 'destructive';
    case ScreeningResultEnum.PENDING:
      return 'warning';
    default:
      return 'secondary';
  }
};

export const getStockStatusColor = (status) => {
  switch (status) {
    case StockStatusEnum.AVAILABLE:
      return 'success';
    case StockStatusEnum.RESERVED:
      return 'warning';
    case StockStatusEnum.USED:
      return 'secondary';
    case StockStatusEnum.EXPIRED:
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const isHemoglobinSafe = (hemoglobin) => {
  return hemoglobin >= HEMOGLOBIN_CONSTRAINTS.MIN_SAFE;
};
