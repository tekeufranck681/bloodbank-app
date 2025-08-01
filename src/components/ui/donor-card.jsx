import { Badge } from '@/components/ui/badge';
import { BloodTypeBadge, StatusBadge } from '@/components/ui/badge-status';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { User, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const DonorCard = ({ donor, donationCount = 0, className }) => {
  const getInitials = (name, email) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'UN';
  };

  const getGenderDisplay = (gender) => {
    if (!gender) return 'Not specified';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  return (
    <Card className={cn("border-0 shadow-card hover:shadow-lg transition-shadow", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-medical rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {getInitials(donor.full_name, donor.email)}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header with Name and Donation Count */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-foreground truncate">
                {donor.full_name || 'Unknown'}
              </h3>
              <div className="flex items-center gap-1 ml-2 bg-medical-red/10 px-2 py-1 rounded-full flex-shrink-0">
                <Heart className="w-4 h-4 text-medical-red" />
                <span className="text-sm font-semibold text-medical-red">
                  {donationCount || 0}
                </span>
              </div>
            </div>
            
            {/* Always Visible Badges Row */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <BloodTypeBadge 
                bloodType={donor.blood_type} 
                className="shadow-sm"
              />
              <StatusBadge 
                status={donor.is_eligible ? 'eligible' : 'ineligible'} 
                className="shadow-sm"
              />
              <Badge variant="outline" className="text-xs font-medium border-gray-300">
                {getGenderDisplay(donor.gender)}
              </Badge>
            </div>

            {/* Contact Information - Always Show All Fields */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {donor.email && donor.email.trim() ? donor.email : 'Not provided'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span>
                  {donor.phone && donor.phone.trim() ? donor.phone : 'Not provided'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {donor.location && donor.location.trim() ? donor.location : 'Not provided'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 flex-shrink-0" />
                <span>{donor.age ? `${donor.age} years old` : 'Age not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
