// Blood types and status constants
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const STATUSES = ['available', 'reserved', 'near-expiry', 'expired'];

// Enums for easier usage
export const BloodType = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-'
};

export const Status = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  NEAR_EXPIRY: 'near-expiry',
  EXPIRED: 'expired',
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Mock data
export const mockDonors = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Main St, City',
    bloodType: 'A+',
    status: 'active',
    lastDonation: '2024-01-15',
    totalDonations: 5
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    address: '456 Oak Ave, City',
    bloodType: 'O-',
    status: 'active',
    lastDonation: '2024-01-10',
    totalDonations: 8
  }
];

export const mockDonations = [
  {
    id: '1',
    donorName: 'John Doe',
    donorId: 'D001',
    bloodType: 'A+',
    volumeMl: 450,
    date: '2024-01-15',
    location: 'Main Hospital',
    status: 'completed'
  },
  {
    id: '2',
    donorName: 'Jane Smith',
    donorId: 'D002',
    bloodType: 'O-',
    volumeMl: 450,
    date: '2024-01-10',
    location: 'City Clinic',
    status: 'completed'
  }
];

export const mockBloodStock = [
  {
    id: 'BS001',
    bloodType: 'A+',
    volumeMl: 450,
    location: 'Main Hospital',
    collectionDate: '2024-01-15',
    expiryDate: '2024-02-15',
    status: 'available'
  },
  {
    id: 'BS002',
    bloodType: 'O-',
    volumeMl: 450,
    location: 'City Clinic',
    collectionDate: '2024-01-10',
    expiryDate: '2024-02-10',
    status: 'available'
  }
];

export const mockBloodManagers = [
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    email: 'sarah@hospital.com',
    phone: '+1234567892',
    department: 'Blood Bank',
    status: 'active'
  }
];
