// src/constants/donorConstants.js

export const GenderEnum = {
  MALE: 'male',
  FEMALE: 'female'
};

export const BloodTypeEnum = {
  A_pos: 'A+',
  A_neg: 'A-',
  B_pos: 'B+',
  B_neg: 'B-',
  AB_pos: 'AB+',
  AB_neg: 'AB-',
  O_pos: 'O+',
  O_neg: 'O-'
};

export const GENDER_OPTIONS = [
  { value: GenderEnum.MALE, label: 'Male' },
  { value: GenderEnum.FEMALE, label: 'Female' }
];

export const BLOOD_TYPE_OPTIONS = [
  { value: BloodTypeEnum.A_pos, label: 'A+' },
  { value: BloodTypeEnum.A_neg, label: 'A-' },
  { value: BloodTypeEnum.B_pos, label: 'B+' },
  { value: BloodTypeEnum.B_neg, label: 'B-' },
  { value: BloodTypeEnum.AB_pos, label: 'AB+' },
  { value: BloodTypeEnum.AB_neg, label: 'AB-' },
  { value: BloodTypeEnum.O_pos, label: 'O+' },
  { value: BloodTypeEnum.O_neg, label: 'O-' }
];

// Helper function to convert display format back to enum key if needed
export const getBloodTypeKey = (displayValue) => {
  const entry = Object.entries(BloodTypeEnum).find(([key, value]) => value === displayValue);
  return entry ? entry[0] : displayValue;
};

export const ELIGIBILITY_OPTIONS = [
  { value: true, label: 'Eligible' },
  { value: false, label: 'Not Eligible' }
];

// Age constraints from your API
export const AGE_CONSTRAINTS = {
  MIN: 18,
  MAX: 65
};

// Default pagination
export const DEFAULT_PAGINATION = {
  skip: 0,
  limit: 20
};
