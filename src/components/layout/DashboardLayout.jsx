import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Heart, Menu, X, Globe, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardTab from '@/components/tabs/DashboardTab';
import BloodManagersTab from '@/components/tabs/BloodManagersTab';
import DonorsTab from '@/components/tabs/DonorsTab';
import DonationsTab from '@/components/tabs/DonationsTab';
import StockManagementTab from '@/components/tabs/StockManagementTab';
import ForecastTab from '@/components/tabs/ForecastTab';
import OptimizationTab from '@/components/tabs/OptimizationTab';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPasswordBanner, setShowPasswordBanner] = useState(false);

  // Check if user is blood manager and should see password change banner
  useEffect(() => {
    if (user && user.role === 'blood_manager') {
      const bannerDismissed = sessionStorage.getItem(`password-banner-dismissed-${user.email || user.sub}`);
      if (!bannerDismissed) {
        setShowPasswordBanner(true);
      }
    }
  }, [user]);

  const dismissPasswordBanner = () => {
    const userEmail = getUserEmail();
    if (userEmail) {
      sessionStorage.setItem(`password-banner-dismissed-${userEmail}`, 'true');
    }
    setShowPasswordBanner(false);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: t('loggedOut'),
      description: t('loggedOutSuccessfully'),
    });
  };

  // Get user email with fallback
  const getUserEmail = () => {
    if (!user) return '';
    return user?.sub || user.email || user.user?.email || user.data?.email || '';
  };

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), component: DashboardTab },
    { id: 'blood-managers', label: t('bloodManagers'), component: BloodManagersTab },
    { id: 'donors', label: t('donors'), component: DonorsTab },
    { id: 'donations', label: t('donations'), component: DonationsTab },
    { id: 'stock', label: t('stockManagement'), component: StockManagementTab },
    { id: 'forecast', label: 'Forecast', component: ForecastTab },
    { id: 'optimization', label: 'Optimization', component: OptimizationTab },
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-medical-red/5">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border shadow-card">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-medical rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{t('bloodBankManagement')}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {t('welcome')}{getUserEmail() ? `, ${getUserEmail()}` : ''}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center space-x-1"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs">{i18n.language === 'en' ? 'FR' : 'EN'}</span>
              </Button>
              {getUserEmail() && (
                <span className="text-sm text-muted-foreground hidden lg:inline truncate max-w-32">
                  {getUserEmail()}
                </span>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">{t('logout')}</span>
              </Button>
            </div>

            <div className="md:hidden flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-card/95"
            >
              <div className="px-3 sm:px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  {getUserEmail() && (
                    <span className="text-xs sm:text-sm text-muted-foreground truncate flex-1 mr-2">
                      {getUserEmail()}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLanguage}
                    className="flex items-center space-x-1 flex-shrink-0"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-xs">{i18n.language === 'en' ? 'FR' : 'EN'}</span>
                  </Button>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('logout')}</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Password Change Banner for Blood Managers */}
        {showPasswordBanner && user?.role === 'blood_manager' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 sm:mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    First Time Login
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                    If this is your first time accessing your account, please change your password under the{' '}
                    <strong>Blood Managers</strong> tab for security.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissPasswordBanner}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-800/20 p-1 h-auto flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Desktop Tab Navigation */}
          <div className="hidden sm:block">
            <TabsList className="grid w-full grid-cols-7 bg-card/50 backdrop-blur-sm h-auto p-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-gradient-medical data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4"
                >
                  <span className="truncate">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Mobile Tab Navigation - Dropdown */}
          <div className="sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full bg-card/50 backdrop-blur-sm h-12">
                <SelectValue>
                  <span className="flex items-center text-sm">
                    {currentTab?.label}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.id} value={tab.id} className="text-sm">
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <tab.component />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardLayout;
