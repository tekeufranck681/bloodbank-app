import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, Filter, Calendar, Droplet, User, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BloodTypeBadge, StatusBadge } from '@/components/ui/badge-status';
import { BloodTypeEnum } from '@/constants/donorConstants';
import { 
  ScreeningResultEnum, 
  CollectionSiteEnum, 
  COLLECTION_SITE_OPTIONS,
  VOLUME_CONSTRAINTS,
  HEMOGLOBIN_CONSTRAINTS,
  getScreeningResultColor 
} from '@/constants/donationConstants';
import { useDonationStore } from '@/stores/donationStore';
import { useDonorStore } from '@/stores/donorStore';
import { useToast } from '@/hooks/use-toast';

const DonationsTab = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [screeningFilter, setScreeningFilter] = useState('all');

  // Modal states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [editFormData, setEditFormData] = useState({
    collection_site: '',
    volume_ml: '',
    hemoglobin_g_dl: ''
  });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states
  const [selectedDonorId, setSelectedDonorId] = useState('');
  const [formData, setFormData] = useState({
    collection_site: '',
    volume_ml: VOLUME_CONSTRAINTS.STANDARD,
    hemoglobin_g_dl: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Store hooks
  const {
    donations,
    isLoading,
    error,
    fetchDonations,
    searchDonations,
    createDonation,
    updateDonation,
    clearError
  } = useDonationStore();

  const {
    donors,
    fetchDonors
  } = useDonorStore();

  const { toast } = useToast();

  // Load data on mount
  useEffect(() => {
    fetchDonations().catch((error) => {
      toast({
        title: 'Error Loading Donations',
        description: error.message,
        variant: "destructive",
      });
    });

    // Load donors for the dropdown
    fetchDonors().catch((error) => {
      console.error('Failed to load donors:', error);
    });
  }, [fetchDonations, fetchDonors, toast]);

  // Add debug logging to see the actual donation data structure
  useEffect(() => {
    if (donations.length > 0) {
      console.log('=== DONATION DATA DEBUG ===');
      console.log('First donation:', donations[0]);
      console.log('Donation keys:', Object.keys(donations[0]));
      console.log('Blood type:', donations[0].blood_type);
      console.log('Donor info:', donations[0].donor);
      console.log('Donor ID:', donations[0].donor_id);
      console.log('==========================');
    }
  }, [donations]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        const filters = {};
        searchDonations(searchTerm, filters).catch((error) => {
          toast({
            title: 'Search Error',
            description: error.message,
            variant: "destructive",
          });
        });
      } else {
        fetchDonations().catch((error) => {
          toast({
            title: 'Error Loading Donations',
            description: error.message,
            variant: "destructive",
          });
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchDonations, fetchDonations, toast]);

  // Filter donations based on current filters
  const filteredDonations = donations.filter(donation => {
    // Add null check first
    if (!donation) return false;
    
    const matchesBloodType = bloodTypeFilter === 'all' || donation.blood_type === bloodTypeFilter;
    const matchesSite = siteFilter === 'all' || donation.collection_site === siteFilter;
    const matchesScreening = screeningFilter === 'all' || donation.screening_result === screeningFilter;
    
    return matchesBloodType && matchesSite && matchesScreening;
  });

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!selectedDonorId) {
      errors.donor = 'Please select a donor';
    }

    if (!formData.collection_site) {
      errors.collection_site = 'Collection site is required';
    }

    if (!formData.volume_ml || formData.volume_ml < VOLUME_CONSTRAINTS.MIN || formData.volume_ml > VOLUME_CONSTRAINTS.MAX) {
      errors.volume_ml = `Volume must be between ${VOLUME_CONSTRAINTS.MIN}-${VOLUME_CONSTRAINTS.MAX}ml`;
    }

    if (formData.hemoglobin_g_dl && (formData.hemoglobin_g_dl < HEMOGLOBIN_CONSTRAINTS.MIN_VALUE || formData.hemoglobin_g_dl > HEMOGLOBIN_CONSTRAINTS.MAX_VALUE)) {
      errors.hemoglobin_g_dl = `Hemoglobin must be between ${HEMOGLOBIN_CONSTRAINTS.MIN_VALUE}-${HEMOGLOBIN_CONSTRAINTS.MAX_VALUE} g/dL`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const donationData = {
        collection_site: formData.collection_site,
        volume_ml: parseFloat(formData.volume_ml),
        hemoglobin_g_dl: formData.hemoglobin_g_dl ? parseFloat(formData.hemoglobin_g_dl) : null
      };

      await createDonation(donationData, selectedDonorId);
      
      // Refresh the donations list to show the new donation
      await fetchDonations();
      
      // Refresh the donations list to show the new donation
      await fetchDonations();
      
      toast({
        title: 'Success',
        description: 'Donation recorded successfully',
      });

      // Reset form
      setFormData({
        collection_site: '',
        volume_ml: VOLUME_CONSTRAINTS.STANDARD,
        hemoglobin_g_dl: ''
      });
      setSelectedDonorId('');
      setFormErrors({});
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getScreeningBadge = (result) => {
    if (!result) return <Badge variant="secondary">Pending</Badge>;
    
    const color = getScreeningResultColor(result);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${color === 'success' ? 'bg-green-100 text-green-800' : 
          color === 'destructive' ? 'bg-red-100 text-red-800' : 
          color === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-gray-100 text-gray-800'}`}>
        {result}
      </span>
    );
  };

  // Helper function to convert blood type for display
  const getBloodTypeDisplay = (bloodType) => {
    if (!bloodType) return 'Unknown';
    
    // Convert enum format to display format
    if (bloodType.includes('_')) {
      return bloodType.replace('_pos', '+').replace('_neg', '-');
    }
    
    return bloodType;
  };

  // Helper function to convert display format back to enum
  const getBloodTypeEnum = (displayType) => {
    if (!displayType) return displayType;
    
    // Convert display format to enum format
    return displayType.replace('+', '_pos').replace('-', '_neg');
  };

  // Modal handlers
  const handleViewDonation = (donation) => {
    console.log('View donation clicked:', donation);
    setSelectedDonation(donation);
    setIsViewDialogOpen(true);
  };

  const handleEditDonation = (donation) => {
    console.log('Edit donation clicked:', donation);
    setSelectedDonation(donation);
    setEditFormData({
      collection_site: donation.collection_site || '',
      volume_ml: donation.volume_ml?.toString() || '',
      hemoglobin_g_dl: donation.hemoglobin_g_dl?.toString() || ''
    });
    setEditFormErrors({});
    setIsEditDialogOpen(true);
  };

  // Edit form validation
  const validateEditForm = () => {
    const errors = {};

    if (editFormData.collection_site && !COLLECTION_SITE_OPTIONS.find(site => site.value === editFormData.collection_site)) {
      errors.collection_site = 'Invalid collection site';
    }

    if (editFormData.volume_ml && (editFormData.volume_ml < VOLUME_CONSTRAINTS.MIN || editFormData.volume_ml > VOLUME_CONSTRAINTS.MAX)) {
      errors.volume_ml = `Volume must be between ${VOLUME_CONSTRAINTS.MIN}-${VOLUME_CONSTRAINTS.MAX}ml`;
    }

    if (editFormData.hemoglobin_g_dl && (editFormData.hemoglobin_g_dl < HEMOGLOBIN_CONSTRAINTS.MIN_VALUE || editFormData.hemoglobin_g_dl > HEMOGLOBIN_CONSTRAINTS.MAX_VALUE)) {
      errors.hemoglobin_g_dl = `Hemoglobin must be between ${HEMOGLOBIN_CONSTRAINTS.MIN_VALUE}-${HEMOGLOBIN_CONSTRAINTS.MAX_VALUE} g/dL`;
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) return;

    setIsUpdating(true);
    try {
      // Only include changed fields in the payload
      const originalDonation = selectedDonation;
      const updatePayload = {};
      
      if (editFormData.collection_site !== originalDonation.collection_site) {
        updatePayload.collection_site = editFormData.collection_site;
      }
      
      if (editFormData.volume_ml && parseFloat(editFormData.volume_ml) !== originalDonation.volume_ml) {
        updatePayload.volume_ml = parseFloat(editFormData.volume_ml);
      }
      
      if (editFormData.hemoglobin_g_dl !== originalDonation.hemoglobin_g_dl?.toString()) {
        updatePayload.hemoglobin_g_dl = editFormData.hemoglobin_g_dl ? parseFloat(editFormData.hemoglobin_g_dl) : null;
      }
      
      // Only update if there are changes
      if (Object.keys(updatePayload).length === 0) {
        toast({
          title: 'No Changes',
          description: 'No changes to save',
          variant: "default",
        });
        setIsEditDialogOpen(false);
        return;
      }

      await updateDonation(selectedDonation.donation_id, updatePayload);
      
      toast({
        title: 'Success',
        description: 'Donation updated successfully',
      });

      setIsEditDialogOpen(false);
      setEditFormData({
        collection_site: '',
        volume_ml: '',
        hemoglobin_g_dl: ''
      });
      setEditFormErrors({});
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    if (editFormErrors[field]) {
      setEditFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isFieldModified = (field) => {
    if (!selectedDonation) return false;
    
    switch (field) {
      case 'collection_site':
        return editFormData.collection_site !== selectedDonation.collection_site;
      case 'volume_ml':
        return editFormData.volume_ml && parseFloat(editFormData.volume_ml) !== selectedDonation.volume_ml;
      case 'hemoglobin_g_dl':
        return editFormData.hemoglobin_g_dl !== (selectedDonation.hemoglobin_g_dl?.toString() || '');
      default:
        return false;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Donations</h2>
          <p className="text-muted-foreground">Track and manage blood donations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-medical hover:shadow-medical transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Record Donation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record New Donation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Donor Selection */}
              <div className="space-y-2">
                <Label htmlFor="donor">Donor *</Label>
                <Select value={selectedDonorId} onValueChange={setSelectedDonorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a donor" />
                  </SelectTrigger>
                  <SelectContent>
                    {donors.map((donor) => (
                      <SelectItem key={donor.id} value={donor.id}>
                        {donor.full_name} - {donor.blood_type?.replace('_pos', '+').replace('_neg', '-') || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.donor && <p className="text-sm text-red-600">{formErrors.donor}</p>}
              </div>

              {/* Collection Site */}
              <div className="space-y-2">
                <Label htmlFor="collection_site">Collection Site *</Label>
                <Select value={formData.collection_site} onValueChange={(value) => setFormData(prev => ({ ...prev, collection_site: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select collection site" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLECTION_SITE_OPTIONS.map((site) => (
                      <SelectItem key={site.value} value={site.value}>
                        {site.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.collection_site && <p className="text-sm text-red-600">{formErrors.collection_site}</p>}
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <Label htmlFor="volume_ml">Volume (ml) *</Label>
                <Input
                  id="volume_ml"
                  type="number"
                  min={VOLUME_CONSTRAINTS.MIN}
                  max={VOLUME_CONSTRAINTS.MAX}
                  value={formData.volume_ml}
                  onChange={(e) => setFormData(prev => ({ ...prev, volume_ml: e.target.value }))}
                  placeholder="450"
                />
                {formErrors.volume_ml && <p className="text-sm text-red-600">{formErrors.volume_ml}</p>}
              </div>

              {/* Hemoglobin */}
              <div className="space-y-2">
                <Label htmlFor="hemoglobin_g_dl">Hemoglobin (g/dL)</Label>
                <Input
                  id="hemoglobin_g_dl"
                  type="number"
                  step="0.1"
                  min={HEMOGLOBIN_CONSTRAINTS.MIN_VALUE}
                  max={HEMOGLOBIN_CONSTRAINTS.MAX_VALUE}
                  value={formData.hemoglobin_g_dl}
                  onChange={(e) => setFormData(prev => ({ ...prev, hemoglobin_g_dl: e.target.value }))}
                  placeholder="13.5"
                />
                {formErrors.hemoglobin_g_dl && <p className="text-sm text-red-600">{formErrors.hemoglobin_g_dl}</p>}
                <p className="text-sm text-muted-foreground">
                  Safe level: ≥ {HEMOGLOBIN_CONSTRAINTS.MIN_SAFE} g/dL
                </p>
                <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  💡 Can be left empty if not sure of screening result and updated after donation processing.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-medical hover:shadow-medical"
                >
                  {isSubmitting ? 'Recording...' : 'Record Donation'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-card">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search donations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Blood Type Filter */}
              <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Blood Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blood Types</SelectItem>
                  {Object.entries(BloodTypeEnum).map(([key, value]) => (
                    <SelectItem key={key} value={value}>{value.replace('_pos', '+').replace('_neg', '-')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Collection Site Filter */}
              <Select value={siteFilter} onValueChange={setSiteFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Collection Site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {COLLECTION_SITE_OPTIONS.map((site) => (
                    <SelectItem key={site.value} value={site.value}>{site.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Screening Result Filter */}
              <Select value={screeningFilter} onValueChange={setScreeningFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Screening Result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value={ScreeningResultEnum.SAFE}>Safe</SelectItem>
                  <SelectItem value={ScreeningResultEnum.UNSAFE}>Unsafe</SelectItem>
                  <SelectItem value={ScreeningResultEnum.PENDING}>Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Donations Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-primary" />
            Donations ({filteredDonations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading donations...</p>
            </div>
          ) : filteredDonations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Hemoglobin</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Screening</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.map((donation) => {
                  // Add safety check for donation object
                  if (!donation || !donation.donation_id) {
                    return null;
                  }
                  
                  return (
                    <TableRow key={donation.donation_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-medical rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {donation.donor?.full_name || 
                               donors.find(d => d.id === donation.donor_id)?.full_name || 
                               'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground">ID: {donation.donor_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <BloodTypeBadge 
                          bloodType={donation.blood_type || 
                                    donors.find(d => d.id === donation.donor_id)?.blood_type || 
                                    'Unknown'} 
                        />
                      </TableCell>
                      <TableCell className="font-medium">{donation.volume_ml}ml</TableCell>
                      <TableCell>
                        {donation.hemoglobin_g_dl ? (
                          <span className={`font-medium ${donation.hemoglobin_g_dl >= HEMOGLOBIN_CONSTRAINTS.MIN_SAFE ? 'text-green-600' : 'text-red-600'}`}>
                            {donation.hemoglobin_g_dl} g/dL
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not tested</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formatDate(donation.donation_date)}
                        </div>
                      </TableCell>
                      <TableCell>{donation.collection_site}</TableCell>
                      <TableCell>
                        {getScreeningBadge(donation.screening_result)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDonation(donation);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDonation(donation);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Droplet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No donations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || bloodTypeFilter !== 'all' || siteFilter !== 'all' || screeningFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Get started by recording your first blood donation'}
              </p>
              {!searchTerm && bloodTypeFilter === 'all' && siteFilter === 'all' && screeningFilter === 'all' && (
                <Button 
                  className="bg-gradient-medical hover:shadow-medical transition-all duration-300"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record Donation
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>


       {/* View Donation Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Donation Details
            </DialogTitle>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-6">
              {/* Donor Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Donor Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <p className="font-medium">
                      {selectedDonation.donor?.full_name || 
                       donors.find(d => d.id === selectedDonation.donor_id)?.full_name || 
                       'Unknown'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Blood Type</Label>
                    <div className="mt-1">
                      <BloodTypeBadge 
                        bloodType={selectedDonation.blood_type || 
                                  donors.find(d => d.id === selectedDonation.donor_id)?.blood_type || 
                                  'Unknown'} 
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Donor ID</Label>
                    <p className="font-medium">{selectedDonation.donor_id}</p>
                  </div>
                </div>
              </div>

              {/* Donation Details */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Droplet className="h-4 w-4" />
                  Donation Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Donation ID</Label>
                    <p className="font-medium">{selectedDonation.donation_id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Date</Label>
                    <p className="font-medium">{formatDate(selectedDonation.donation_date)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Collection Site</Label>
                    <p className="font-medium">{selectedDonation.collection_site}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Volume</Label>
                    <p className="font-medium">{selectedDonation.volume_ml}ml</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Hemoglobin</Label>
                    <p className="font-medium">
                      {selectedDonation.hemoglobin_g_dl ? (
                        <span className={selectedDonation.hemoglobin_g_dl >= HEMOGLOBIN_CONSTRAINTS.MIN_SAFE ? 'text-green-600' : 'text-red-600'}>
                          {selectedDonation.hemoglobin_g_dl} g/dL
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not tested</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Screening Result</Label>
                    <div className="mt-1">
                      {getScreeningBadge(selectedDonation.screening_result)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Donation Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Donation
            </DialogTitle>
          </DialogHeader>
          {selectedDonation && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Collection Site */}
              <div className="space-y-2">
                <Label htmlFor="edit_collection_site" className="flex items-center gap-2">
                  Collection Site
                  {isFieldModified('collection_site') && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      Modified
                    </span>
                  )}
                </Label>
                <Select 
                  value={editFormData.collection_site} 
                  onValueChange={(value) => handleEditInputChange('collection_site', value)}
                >
                  <SelectTrigger className={editFormErrors.collection_site ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select collection site" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLECTION_SITE_OPTIONS.map((site) => (
                      <SelectItem key={site.value} value={site.value}>
                        {site.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editFormErrors.collection_site && <p className="text-sm text-destructive">{editFormErrors.collection_site}</p>}
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <Label htmlFor="edit_volume_ml" className="flex items-center gap-2">
                  Volume (ml)
                  {isFieldModified('volume_ml') && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      Modified
                    </span>
                  )}
                </Label>
                <Input
                  id="edit_volume_ml"
                  type="number"
                  min={VOLUME_CONSTRAINTS.MIN}
                  max={VOLUME_CONSTRAINTS.MAX}
                  value={editFormData.volume_ml}
                  onChange={(e) => handleEditInputChange('volume_ml', e.target.value)}
                  placeholder="450"
                  className={editFormErrors.volume_ml ? 'border-destructive' : ''}
                />
                {editFormErrors.volume_ml && <p className="text-sm text-destructive">{editFormErrors.volume_ml}</p>}
              </div>

              {/* Hemoglobin */}
              <div className="space-y-2">
                <Label htmlFor="edit_hemoglobin_g_dl" className="flex items-center gap-2">
                  Hemoglobin (g/dL)
                  {isFieldModified('hemoglobin_g_dl') && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      Modified
                    </span>
                  )}
                </Label>
                <Input
                  id="edit_hemoglobin_g_dl"
                  type="number"
                  step="0.1"
                  min={HEMOGLOBIN_CONSTRAINTS.MIN_VALUE}
                  max={HEMOGLOBIN_CONSTRAINTS.MAX_VALUE}
                  value={editFormData.hemoglobin_g_dl}
                  onChange={(e) => handleEditInputChange('hemoglobin_g_dl', e.target.value)}
                  placeholder="13.5"
                  className={editFormErrors.hemoglobin_g_dl ? 'border-destructive' : ''}
                />
                {editFormErrors.hemoglobin_g_dl && <p className="text-sm text-destructive">{editFormErrors.hemoglobin_g_dl}</p>}
                <p className="text-sm text-muted-foreground">
                  Safe level: ≥ {HEMOGLOBIN_CONSTRAINTS.MIN_SAFE} g/dL
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-gradient-medical hover:shadow-medical"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Donation
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </motion.div>
  );
};

export default DonationsTab;

     