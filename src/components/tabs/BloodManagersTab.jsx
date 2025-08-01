import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Eye, Edit, Phone, Mail, User, Calendar, Loader2, AlertTriangle, X, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useManagerStore } from '@/stores/managerStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';

const BloodManagersTab = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedManagerForView, setSelectedManagerForView] = useState(null);
  const [selectedManagerForEdit, setSelectedManagerForEdit] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: ''
  });
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    phone_number: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { 
    managers, 
    isLoading, 
    error, 
    fetchManagers, 
    clearError,
    setSelectedManager,
    registerManager,
    updateManager 
  } = useManagerStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  // Check if current user is admin
  const isAdmin = () => {
    return user && (user.role === 'admin' || user.is_admin === true);
  };

  // Add this helper function similar to DashboardLayout
  const getUserEmail = () => {
    if (!user) return '';
    return user?.sub || user.email || user.user?.email || user.data?.email || '';
  };

  // Add this helper function to check if a field has been modified
  const isFieldModified = (fieldName) => {
    if (!selectedManagerForEdit) return false;
    
    switch (fieldName) {
      case 'full_name':
        return editFormData.full_name.trim() !== selectedManagerForEdit.full_name;
      case 'phone_number':
        return editFormData.phone_number.trim() !== selectedManagerForEdit.phone_number;
      case 'password':
        return editFormData.password.trim() !== '';
      default:
        return false;
    }
  };

  // Fetch managers on component mount
  useEffect(() => {
    fetchManagers().catch((error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    });
  }, [fetchManagers, toast, t]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const filteredManagers = managers.filter(manager =>
    manager.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.phone_number.includes(searchTerm)
  );

  const isCurrentUser = (manager) => {
    if (!user || !manager) return false;
    
    const userEmail = getUserEmail();
    const managerEmail = manager.email;
    
    return userEmail && managerEmail && userEmail === managerEmail;
  };

  const handleViewManager = (manager) => {
    setSelectedManagerForView(manager);
    setViewModalOpen(true);
  };

  const handleEditManager = (manager) => {
    if (!isCurrentUser(manager)) {
      toast({
        title: t('accessDenied'),
        description: t('canOnlyEditOwnProfile'),
        variant: "destructive",
      });
      return;
    }
    
    setSelectedManagerForEdit(manager);
    setEditFormData({
      full_name: manager.full_name || '',
      phone_number: manager.phone_number || '',
      password: '',
      confirmPassword: ''
    });
    setEditFormErrors({});
    setEditModalOpen(true);
  };

  const handleAddManager = () => {
    if (!isAdmin()) {
      toast({
        title: t('accessDenied'),
        description: t('adminOnlyFeature'),
        variant: "destructive",
      });
      return;
    }
    setAddModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = t('fullNameRequired');
    }
    
    if (!formData.email.trim()) {
      errors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('emailInvalid');
    }
    
    if (!formData.phone_number.trim()) {
      errors.phone_number = t('phoneRequired');
    }
    
    if (!formData.password) {
      errors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      errors.password = t('passwordMinLength');
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('passwordsDoNotMatch');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { confirmPassword, ...registrationData } = formData;
      await registerManager(registrationData);
      
      toast({
        title: t('success'),
        description: t('managerRegisteredSuccessfully'),
      });
      
      setAddModalOpen(false);
      setFormData({
        full_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirmPassword: ''
      });
      setFormErrors({});
    } catch (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateEditForm = () => {
    const errors = {};
    
    if (editFormData.full_name && !editFormData.full_name.trim()) {
      errors.full_name = t('fullNameRequired');
    }
    
    if (editFormData.phone_number && !editFormData.phone_number.trim()) {
      errors.phone_number = t('phoneRequired');
    }
    
    if (editFormData.password) {
      if (editFormData.password.length < 6) {
        errors.password = t('passwordMinLength');
      }
      
      if (editFormData.password !== editFormData.confirmPassword) {
        errors.confirmPassword = t('passwordsDoNotMatch');
      }
    } else if (editFormData.confirmPassword) {
      errors.confirmPassword = t('passwordRequired');
    }
    
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Only include changed fields in the payload
      const originalManager = selectedManagerForEdit;
      const updatePayload = {};
      
      if (editFormData.full_name !== originalManager.full_name) {
        updatePayload.full_name = editFormData.full_name;
      }
      
      if (editFormData.phone_number !== originalManager.phone_number) {
        updatePayload.phone_number = editFormData.phone_number;
      }
      
      if (editFormData.password) {
        updatePayload.password = editFormData.password;
      }
      
      // Only update if there are changes
      if (Object.keys(updatePayload).length === 0) {
        toast({
          title: t('noChanges'),
          description: t('noChangesToSave'),
          variant: "default",
        });
        setEditModalOpen(false);
        return;
      }
      
      await updateManager(selectedManagerForEdit.id, updatePayload);
      
      toast({
        title: t('success'),
        description: t('profileUpdatedSuccessfully'),
      });
      
      setEditModalOpen(false);
      setEditFormData({
        full_name: '',
        phone_number: '',
        password: '',
        confirmPassword: ''
      });
      setEditFormErrors({});
    } catch (error) {
      toast({
        title: t('error'),
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (fullName, email) => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-0 shadow-card max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="text-destructive mb-4">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">{t('errorLoadingManagers')}</h3>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
            <Button onClick={() => fetchManagers()} variant="outline">
              {t('retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 sm:px-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{t('bloodManagers')}</h2>
          <p className="text-muted-foreground text-sm sm:text-base">{t('manageBloodBankStaff')}</p>
        </div>
        {isAdmin() && (
          <Button 
            className="bg-gradient-medical hover:shadow-medical transition-all duration-300 w-full sm:w-auto"
            onClick={handleAddManager}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addManager')}
          </Button>
        )}
      </motion.div>

      {/* Search Bar */}
      <Card className="border-0 shadow-card mx-4 sm:mx-0">
        <CardContent className="p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchManagersPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-muted-foreground">{t('loading')}</span>
          </div>
        </div>
      )}

      {/* Managers Grid */}
      {!isLoading && filteredManagers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 sm:px-0">
          {filteredManagers.map((manager, index) => (
            <motion.div
              key={manager.id}
              variants={itemVariants}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-0 shadow-card ${isMobile ? 'hover:shadow-card' : 'hover:shadow-medical'} transition-all duration-300 group h-full`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-gradient-medical rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {getInitials(manager.full_name, manager.email)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-sm truncate">
                          {manager.full_name || t('noName')}
                        </h3>
                        <p className="text-xs text-muted-foreground">{t('bloodManager')}</p>
                      </div>
                    </div>
                    {isCurrentUser(manager) ? (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 flex-shrink-0">
                        {t('you')}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 flex-shrink-0">
                        {t('active')}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="truncate">{manager.email}</span>
                    </div>
                    {manager.phone_number && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{manager.phone_number}</span>
                      </div>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {t('joined')} {formatDate(manager.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs truncate max-w-[120px]">
                      ID: {manager.id.substring(0, 8)}...
                    </Badge>
                    <div className={`flex space-x-1 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewManager(manager)}
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      {isCurrentUser(manager) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditManager(manager)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : !isLoading ? (
        /* Empty State */
        <Card className="border-0 shadow-card mx-4 sm:mx-0">
          <CardContent className="p-6 sm:p-12 text-center">
            <User className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-2">
              {t('noManagersFound')}
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              {searchTerm ? t('tryAdjustingSearch') : t('getStartedAddingManager')}
            </p>
            {!searchTerm && isAdmin() && (
              <Button 
                className="bg-gradient-medical hover:shadow-medical transition-all duration-300"
                onClick={handleAddManager}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addManager')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* View Manager Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t('managerDetails')}
            </DialogTitle>
          </DialogHeader>
          {selectedManagerForView && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">
                    {getInitials(selectedManagerForView.full_name, selectedManagerForView.email)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedManagerForView.full_name || t('noName')}
                  </h3>
                  <p className="text-muted-foreground">{t('bloodManager')}</p>
                  {isCurrentUser(selectedManagerForView) && (
                    <Badge variant="secondary" className="mt-1">
                      {t('you')}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('email')}</Label>
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedManagerForView.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('phoneNumber')}</Label>
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedManagerForView.phone_number}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('joinDate')}</Label>
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDate(selectedManagerForView.created_at)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('managerId')}</Label>
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{selectedManagerForView.id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Manager Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t('addNewManager')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitRegistration} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t('fullName')} *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder={t('enterFullName')}
                className={formErrors.full_name ? 'border-destructive' : ''}
              />
              {formErrors.full_name && (
                <p className="text-sm text-destructive">{formErrors.full_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')} *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('enterEmail')}
                className={formErrors.email ? 'border-destructive' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-destructive">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">{t('phoneNumber')} *</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder={t('enterPhoneNumber')}
                className={formErrors.phone_number ? 'border-destructive' : ''}
              />
              {formErrors.phone_number && (
                <p className="text-sm text-destructive">{formErrors.phone_number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')} *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={t('enterPassword')}
                className={formErrors.password ? 'border-destructive' : ''}
              />
              {formErrors.password && (
                <p className="text-sm text-destructive">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')} *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder={t('confirmPassword')}
                className={formErrors.confirmPassword ? 'border-destructive' : ''}
              />
              {formErrors.confirmPassword && (
                <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                className="bg-gradient-medical hover:shadow-medical"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('registering')}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('registerManager')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Manager Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {t('editProfile')}
            </DialogTitle>
          </DialogHeader>
          {selectedManagerForEdit && (
            <form onSubmit={handleSubmitUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_full_name" className="flex items-center gap-2">
                  {t('fullName')}
                  {isFieldModified('full_name') && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      {t('modified')}
                    </span>
                  )}
                </Label>
                <Input
                  id="edit_full_name"
                  value={editFormData.full_name}
                  onChange={(e) => handleEditInputChange('full_name', e.target.value)}
                  placeholder={t('enterFullName')}
                  className={`${editFormErrors.full_name ? 'border-destructive' : ''} ${
                    isFieldModified('full_name') ? 'border-blue-300 bg-blue-50' : ''
                  }`}
                />
                {editFormErrors.full_name && (
                  <p className="text-sm text-destructive">{editFormErrors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_phone_number" className="flex items-center gap-2">
                  {t('phoneNumber')}
                  {isFieldModified('phone_number') && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      {t('modified')}
                    </span>
                  )}
                </Label>
                <Input
                  id="edit_phone_number"
                  value={editFormData.phone_number}
                  onChange={(e) => handleEditInputChange('phone_number', e.target.value)}
                  placeholder={t('enterPhoneNumber')}
                  className={`${editFormErrors.phone_number ? 'border-destructive' : ''} ${
                    isFieldModified('phone_number') ? 'border-blue-300 bg-blue-50' : ''
                  }`}
                />
                {editFormErrors.phone_number && (
                  <p className="text-sm text-destructive">{editFormErrors.phone_number}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_password" className="flex items-center gap-2">
                  {t('newPassword')} ({t('optional')})
                  {isFieldModified('password') && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      {t('modified')}
                    </span>
                  )}
                </Label>
                <Input
                  id="edit_password"
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => handleEditInputChange('password', e.target.value)}
                  placeholder={t('enterNewPassword')}
                  className={`${editFormErrors.password ? 'border-destructive' : ''} ${
                    isFieldModified('password') ? 'border-blue-300 bg-blue-50' : ''
                  }`}
                />
                {editFormErrors.password && (
                  <p className="text-sm text-destructive">{editFormErrors.password}</p>
                )}
              </div>

              {editFormData.password && (
                <div className="space-y-2">
                  <Label htmlFor="edit_confirmPassword">{t('confirmNewPassword')}</Label>
                  <Input
                    id="edit_confirmPassword"
                    type="password"
                    value={editFormData.confirmPassword}
                    onChange={(e) => handleEditInputChange('confirmPassword', e.target.value)}
                    placeholder={t('confirmNewPassword')}
                    className={editFormErrors.confirmPassword ? 'border-destructive' : ''}
                  />
                  {editFormErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{editFormErrors.confirmPassword}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  disabled={isUpdating}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-medical hover:shadow-medical"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('updating')}
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      {t('updateProfile')}
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

export default BloodManagersTab;
