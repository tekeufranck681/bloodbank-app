import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail, MapPin, Calendar, Loader2, AlertTriangle, User, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { BloodTypeBadge, StatusBadge } from '@/components/ui/badge-status';
import { BloodTypeEnum, GenderEnum, BLOOD_TYPE_OPTIONS, GENDER_OPTIONS } from '@/constants/donorConstants';
import { useDonorStore } from '@/stores/donorStore';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DonorsTab = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    blood_type: '',
    location: '',
    is_eligible: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    donors,
    isLoading,
    error,
    fetchDonors,
    searchDonors,
    createDonor,
    updateDonor,
    deleteDonor,
    clearError
  } = useDonorStore();
  
  const { toast } = useToast();

  const bloodTypes = Object.values(BloodTypeEnum);
  const genders = Object.values(GenderEnum);

  // Form validation
  const validateForm = (data) => {
    const errors = {};
    
    if (!data.full_name.trim()) {
      errors.full_name = t('donorNameRequired');
    }
    
    if (!data.email.trim()) {
      errors.email = t('donorEmailRequired');
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = t('donorEmailInvalid');
    }
    
    if (!data.phone.trim()) {
      errors.phone = t('donorPhoneRequired');
    }
    
    if (!data.gender) {
      errors.gender = t('donorGenderRequired');
    }
    
    if (!data.age || data.age < 18 || data.age > 65) {
      errors.age = t('donorAgeInvalid');
    }
    
    if (!data.blood_type) {
      errors.blood_type = t('donorBloodTypeRequired');
    }
    
    if (!data.location.trim()) {
      errors.location = t('donorLocationRequired');
    }
    
    return errors;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      gender: '',
      age: '',
      blood_type: '',
      location: '',
      is_eligible: true
    });
    setFormErrors({});
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Fetch donors on component mount
  useEffect(() => {
    fetchDonors().catch((error) => {
      toast({
        title: 'Error Loading Donors',
        description: error.message,
        variant: "destructive",
      });
    });
  }, [fetchDonors, toast]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Filter donors based on current filters
  const filteredDonors = donors.filter(donor => {
    const matchesBloodType = bloodTypeFilter === 'all' || donor.blood_type === bloodTypeFilter;
    const matchesGender = genderFilter === 'all' || donor.gender === genderFilter;
    
    return matchesBloodType && matchesGender;
  });

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        const filters = {};
        if (bloodTypeFilter !== 'all') filters.blood_type = bloodTypeFilter;
        if (genderFilter !== 'all') filters.gender = genderFilter;
        
        searchDonors(searchTerm, filters).catch((error) => {
          toast({
            title: 'Search Error',
            description: error.message,
            variant: "destructive",
          });
        });
      } else {
        // If no search term, fetch all donors with current filters
        const filters = {};
        if (bloodTypeFilter !== 'all') filters.blood_type = bloodTypeFilter;
        if (genderFilter !== 'all') filters.gender = genderFilter;
        
        fetchDonors(filters).catch((error) => {
          toast({
            title: 'Error Loading Donors',
            description: error.message,
            variant: "destructive",
          });
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, bloodTypeFilter, genderFilter, searchDonors, fetchDonors, toast]);

  const handleAction = (action, donor) => {
    toast({
      title: `${action} Donor`,
      description: `${action} action for ${donor.full_name} would be implemented here.`,
    });
  };

  const handleToggleEligibility = async (donor) => {
    try {
      await toggleDonorEligibility(donor.id);
      toast({
        title: 'Success',
        description: `${donor.full_name} eligibility updated successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Modal handlers
  const handleViewDonor = (donor) => {
    setSelectedDonor(donor);
    setViewModalOpen(true);
  };

  const handleAddDonor = () => {
    resetForm();
    setAddModalOpen(true);
  };

  const handleEditDonor = (donor) => {
    setSelectedDonor(donor);
    setFormData({
      full_name: donor.full_name || '',
      email: donor.email || '',
      phone: donor.phone || '',
      gender: donor.gender || '',
      age: donor.age?.toString() || '',
      blood_type: donor.blood_type || '',
      location: donor.location || '',
      is_eligible: donor.is_eligible ?? true
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleDeleteDonor = (donor) => {
    setSelectedDonor(donor);
    setDeleteModalOpen(true);
  };

  // Form submissions
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const donorData = {
        ...formData,
        age: parseInt(formData.age),
        email: formData.email || null,
        phone: formData.phone || null,
        location: formData.location || null
      };
      
      // Log the payload being sent to backend
      console.log('=== CREATE DONOR PAYLOAD ===');
      console.log('Form Data:', formData);
      console.log('Processed Donor Data:', donorData);
      console.log('Schema Requirements:');
      console.log('- full_name (required):', donorData.full_name);
      console.log('- email (optional):', donorData.email);
      console.log('- phone (optional):', donorData.phone);
      console.log('- gender (required):', donorData.gender);
      console.log('- age (required, 18-65):', donorData.age);
      console.log('- blood_type (required):', donorData.blood_type);
      console.log('- location (optional):', donorData.location);
      console.log('- is_eligible (optional, default true):', donorData.is_eligible);
      console.log('============================');
      
      await createDonor(donorData);
      
      toast({
        title: t('success'),
        description: t('donorRegisteredSuccessfully'),
      });
      
      setAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('=== CREATE DONOR ERROR ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('==========================');
      
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updateData = {
        ...formData,
        age: parseInt(formData.age),
        email: formData.email || null,
        phone: formData.phone || null,
        location: formData.location || null
      };
      
      // Log the payload being sent to backend
      console.log('=== UPDATE DONOR PAYLOAD ===');
      console.log('Donor ID:', selectedDonor.id);
      console.log('Form Data:', formData);
      console.log('Processed Update Data:', updateData);
      console.log('Schema Requirements:');
      console.log('- full_name (required):', updateData.full_name);
      console.log('- email (optional):', updateData.email);
      console.log('- phone (optional):', updateData.phone);
      console.log('- gender (required):', updateData.gender);
      console.log('- age (required, 18-65):', updateData.age);
      console.log('- blood_type (required):', updateData.blood_type);
      console.log('- location (optional):', updateData.location);
      console.log('- is_eligible (optional, default true):', updateData.is_eligible);
      console.log('============================');
      
      await updateDonor(selectedDonor.id, updateData);
      
      toast({
        title: t('success'),
        description: t('donorUpdatedSuccessfully'),
      });
      
      setEditModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('=== UPDATE DONOR ERROR ===');
      console.error('Donor ID:', selectedDonor?.id);
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('==========================');
      
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDonor(selectedDonor.id);
      
      toast({
        title: t('success'),
        description: t('donorDeletedSuccessfully'),
      });
      
      setDeleteModalOpen(false);
      setSelectedDonor(null);
    } catch (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Donors Report', 20, 20);
      
      // Export date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 35);
      doc.text(`Total Records: ${filteredDonors.length}`, 20, 45);
      
      // Applied filters info
      let filtersText = 'Applied Filters: ';
      const activeFilters = [];
      if (searchTerm) activeFilters.push(`Search: "${searchTerm}"`);
      if (bloodTypeFilter !== 'all') activeFilters.push(`Blood Type: ${bloodTypeFilter}`);
      if (genderFilter !== 'all') activeFilters.push(`Gender: ${genderFilter}`);
      
      if (activeFilters.length > 0) {
        filtersText += activeFilters.join(', ');
      } else {
        filtersText += 'None';
      }
      
      doc.text(filtersText, 20, 55);
      
      // Table data
      const tableData = filteredDonors.map(donor => [
        donor.full_name || 'Unknown',
        donor.email || 'N/A',
        donor.phone || 'N/A',
        donor.gender ? donor.gender.charAt(0).toUpperCase() + donor.gender.slice(1) : 'Unknown',
        donor.age?.toString() || 'Unknown',
        donor.blood_type || 'Unknown',
        donor.location || 'N/A',
        donor.is_eligible ? 'Eligible' : 'Ineligible'
      ]);
      
      // Table headers
      const headers = [
        'Full Name',
        'Email',
        'Phone',
        'Gender',
        'Age',
        'Blood Type',
        'Location',
        'Eligibility'
      ];
      
      // Generate table using autoTable
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 65,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Full Name
          1: { cellWidth: 30 }, // Email
          2: { cellWidth: 20 }, // Phone
          3: { cellWidth: 15 }, // Gender
          4: { cellWidth: 12 }, // Age
          5: { cellWidth: 18 }, // Blood Type
          6: { cellWidth: 25 }, // Location
          7: { cellWidth: 18 }, // Eligibility
        },
      });
      
      // Save the PDF
      const fileName = `donors-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: 'Success',
        description: `Report exported successfully as ${fileName}`,
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report',
        variant: 'destructive',
      });
    }
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
          <h2 className="text-3xl font-bold text-foreground">Donors</h2>
          <p className="text-muted-foreground">Manage blood donors and their information</p>
        </div>
        <Button 
          className="bg-gradient-medical hover:shadow-medical transition-all duration-300"
          onClick={handleAddDonor}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Donor
        </Button>
      </motion.div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Blood type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Types</SelectItem>
                {bloodTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                {genders.map(gender => (
                  <SelectItem key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={exportToPDF}
              disabled={filteredDonors.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="border-0 shadow-card">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Loading donors...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the donor data</p>
          </CardContent>
        </Card>
      )}

      {/* Donors Grid */}
      {!isLoading && filteredDonors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map((donor, index) => (
            <motion.div
              key={donor.id}
              variants={itemVariants}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-card hover:shadow-medical transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-medical rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {donor.full_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{donor.full_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <BloodTypeBadge bloodType={donor.blood_type} />
                          <StatusBadge status={donor.is_eligible ? 'eligible' : 'ineligible'} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {donor.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="w-4 h-4 mr-2" />
                        {donor.email}
                      </div>
                    )}
                    {donor.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 mr-2" />
                        {donor.phone}
                      </div>
                    )}
                    {donor.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {donor.location}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      Age: {donor.age} | Gender: {donor.gender}
                    </div>
                    {donor.created_at && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        Registered: {new Date(donor.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end">
                    <div className={`flex space-x-2 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDonor(donor)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditDonor(donor)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDonor(donor)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : !isLoading ? (
        /* Empty State */
        <Card className="border-0 shadow-card">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No donors found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || bloodTypeFilter !== 'all' || genderFilter !== 'all'
                ? 'Try adjusting your search criteria' 
                : 'Get started by registering your first blood donor'}
            </p>
            {!searchTerm && bloodTypeFilter === 'all' && genderFilter === 'all' && (
              <Button 
                className="bg-gradient-medical hover:shadow-medical transition-all duration-300"
                onClick={() => handleAction('Add', { full_name: 'new donor' })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Donor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* View Donor Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t('donorDetails')}
            </DialogTitle>
          </DialogHeader>
          {selectedDonor && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">
                    {selectedDonor.full_name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedDonor.full_name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <BloodTypeBadge bloodType={selectedDonor.blood_type} />
                    <StatusBadge status={selectedDonor.is_eligible ? 'eligible' : 'ineligible'} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('email')}</Label>
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedDonor.email || 'Not provided'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('phoneNumber')}</Label>
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedDonor.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('age')}</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">{selectedDonor.age} years</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('gender')}</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm capitalize">{selectedDonor.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('location')}</Label>
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedDonor.location || 'Not provided'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('donorId')}</Label>
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{selectedDonor.id}</span>
                  </div>
                </div>

                {selectedDonor.created_at && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('registrationDate')}</Label>
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(selectedDonor.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Donor Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t('addNewDonor')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t('fullName')} *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder={t('enterDonorName')}
                className={formErrors.full_name ? 'border-destructive' : ''}
              />
              {formErrors.full_name && (
                <p className="text-sm text-destructive">{formErrors.full_name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">{t('gender')} *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className={formErrors.gender ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('selectGender')} />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map(gender => (
                      <SelectItem key={gender} value={gender}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.gender && (
                  <p className="text-sm text-destructive">{formErrors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">{t('age')} *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="65"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder={t('enterAge')}
                  className={formErrors.age ? 'border-destructive' : ''}
                />
                {formErrors.age && (
                  <p className="text-sm text-destructive">{formErrors.age}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blood_type">{t('bloodType')} *</Label>
              <Select value={formData.blood_type} onValueChange={(value) => handleInputChange('blood_type', value)}>
                <SelectTrigger className={formErrors.blood_type ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('selectBloodType')} />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.blood_type && (
                <p className="text-sm text-destructive">{formErrors.blood_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')} *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('enterDonorEmail')}
                className={formErrors.email ? 'border-destructive' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-destructive">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('phoneNumber')} *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={t('enterDonorPhone')}
                className={formErrors.phone ? 'border-destructive' : ''}
              />
              {formErrors.phone && (
                <p className="text-sm text-destructive">{formErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t('location')} *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={t('enterLocation')}
                className={formErrors.location ? 'border-destructive' : ''}
              />
              {formErrors.location && (
                <p className="text-sm text-destructive">{formErrors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_eligible">{t('eligibilityStatus')}</Label>
              <Select value={formData.is_eligible.toString()} onValueChange={(value) => handleInputChange('is_eligible', value === 'true')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{t('eligible')}</SelectItem>
                  <SelectItem value="false">{t('ineligible')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('adding')}...
                  </>
                ) : (
                  t('addDonor')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Donor Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {t('editDonorInfo')}
            </DialogTitle>
          </DialogHeader>
          {selectedDonor && (
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              {/* Same form fields as Add Modal but with edit title */}
              <div className="space-y-2">
                <Label htmlFor="edit_full_name">{t('fullName')} *</Label>
                <Input
                  id="edit_full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder={t('enterDonorName')}
                  className={formErrors.full_name ? 'border-destructive' : ''}
                />
                {formErrors.full_name && (
                  <p className="text-sm text-destructive">{formErrors.full_name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_gender">{t('gender')} *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className={formErrors.gender ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('selectGender')} />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map(gender => (
                        <SelectItem key={gender} value={gender}>
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.gender && (
                    <p className="text-sm text-destructive">{formErrors.gender}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_age">{t('age')} *</Label>
                  <Input
                    id="edit_age"
                    type="number"
                    min="18"
                    max="65"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder={t('enterAge')}
                    className={formErrors.age ? 'border-destructive' : ''}
                  />
                  {formErrors.age && (
                    <p className="text-sm text-destructive">{formErrors.age}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_blood_type">{t('bloodType')} *</Label>
                <Select value={formData.blood_type} onValueChange={(value) => handleInputChange('blood_type', value)}>
                  <SelectTrigger className={formErrors.blood_type ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('selectBloodType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.blood_type && (
                  <p className="text-sm text-destructive">{formErrors.blood_type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_email">{t('email')} *</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t('enterDonorEmail')}
                  className={formErrors.email ? 'border-destructive' : ''}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_phone">{t('phoneNumber')} *</Label>
                <Input
                  id="edit_phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={t('enterDonorPhone')}
                  className={formErrors.phone ? 'border-destructive' : ''}
                />
                {formErrors.phone && (
                  <p className="text-sm text-destructive">{formErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_location">{t('location')} *</Label>
                <Input
                  id="edit_location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={t('enterLocation')}
                  className={formErrors.location ? 'border-destructive' : ''}
                />
                {formErrors.location && (
                  <p className="text-sm text-destructive">{formErrors.location}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_is_eligible">{t('eligibilityStatus')}</Label>
                <Select value={formData.is_eligible.toString()} onValueChange={(value) => handleInputChange('is_eligible', value === 'true')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">{t('eligible')}</SelectItem>
                    <SelectItem value="false">{t('ineligible')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('updating')}...
                    </>
                  ) : (
                    t('updateDonor')
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('confirmDeleteDonor')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedDonor && (
                <>
                  Are you sure you want to delete <strong>{selectedDonor.full_name}</strong>? 
                  This action cannot be undone and will permanently remove the donor from the system.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('deleteDonor')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default DonorsTab;
