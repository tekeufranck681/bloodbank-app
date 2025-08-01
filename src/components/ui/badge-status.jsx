import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const BloodTypeBadge = ({ bloodType, className }) => {
  const getBloodTypeColor = (type) => {
    if (!type) return 'bg-muted text-muted-foreground';
    
    // Normalize the blood type to display format
    const normalizedType = type.includes('_') ? 
      type.replace('_pos', '+').replace('_neg', '-') : type;
    
    switch (normalizedType) {
      case 'A+':
        return 'bg-red-500 text-white';
      case 'A-':
        return 'bg-red-600 text-white';
      case 'B+':
        return 'bg-blue-500 text-white';
      case 'B-':
        return 'bg-blue-600 text-white';
      case 'AB+':
        return 'bg-purple-500 text-white';
      case 'AB-':
        return 'bg-purple-600 text-white';
      case 'O+':
        return 'bg-green-500 text-white';
      case 'O-':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getBloodTypeDisplay = (type) => {
    if (!type) return 'Unknown';
    
    // Convert enum format to display format
    if (type.includes('_')) {
      return type.replace('_pos', '+').replace('_neg', '-');
    }
    
    return type;
  };

  return (
    <Badge className={cn(getBloodTypeColor(bloodType), 'font-semibold', className)}>
      {getBloodTypeDisplay(bloodType)}
    </Badge>
  );
};

export const StatusBadge = ({ status, className }) => {
  const getStatusColor = (status) => {
    if (!status) return 'bg-muted text-muted-foreground';
    
    switch (status) {
      case 'available':
      case 'active':
      case 'eligible':
        return 'bg-emerald-500 text-white';
      case 'reserved':
        return 'bg-amber-500 text-white';
      case 'near-expiry':
        return 'bg-orange-500 text-white';
      case 'expired':
      case 'inactive':
      case 'suspended':
      case 'ineligible':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    
    switch (status) {
      case 'near-expiry':
        return 'Near Expiry';
      case 'eligible':
        return 'Eligible';
      case 'ineligible':
        return 'Ineligible';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Badge className={cn(getStatusColor(status), 'font-medium', className)}>
      {getStatusText(status)}
    </Badge>
  );
};
