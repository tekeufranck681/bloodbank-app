import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { UserRole } from '@/constants/userRoles';

const LoginForm = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(UserRole.ADMIN);
  const { login, isLoading, error, clearError } = useAuthStore();
  const { toast } = useToast();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    clearError();

    try {
      // Determine payload structure based on role
      let credentials;
      if (role === UserRole.BLOOD_MANAGER) {
        // Blood manager only needs email and password
        credentials = { email, password };
      } else {
        // Admin/other roles need email, password, and role
        credentials = { email, password, role };
      }

      await login(credentials);
      
      toast({
        title: t('loginSuccessful'),
        description: t('welcomeMessage'),
      });
    } catch (error) {
      toast({
        title: t('loginFailed'),
        description: error.message || t('checkCredentials'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-medical-red/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-medical border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center space-x-1"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs">{i18n.language === 'en' ? 'FR' : 'EN'}</span>
              </Button>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center mb-4"
            >
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {t('bloodBankManagement')}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-foreground">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('enterEmail')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 border-border focus:border-primary"
                    required
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-foreground">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('enterPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-background/50 border-border focus:border-primary"
                    required
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <Label className="text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('selectRole')}
                </Label>
                <RadioGroup
                  value={role}
                  onValueChange={setRole}
                  className="grid grid-cols-2 gap-4"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={UserRole.ADMIN} id="admin" />
                    <Label htmlFor="admin" className="text-sm">{t('admin')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={UserRole.BLOOD_MANAGER} id="blood_manager" />
                    <Label htmlFor="blood_manager" className="text-sm">{t('bloodManager')}</Label>
                  </div>
                </RadioGroup>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-destructive text-center"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-medical hover:shadow-medical transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? t('signingIn') : t('signIn')}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-4">
                {t('enterCredentials')}
              </p>
              
              {/* Demo Credentials Section */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground mb-2">Demo Credentials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-background/50 rounded p-3 border">
                    <p className="font-medium text-foreground mb-1">Blood Manager</p>
                    <p className="text-muted-foreground">Email: franck@gmail.com</p>
                    <p className="text-muted-foreground">Password: franck</p>
                  </div>
                  <div className="bg-background/50 rounded p-3 border">
                    <p className="font-medium text-foreground mb-1">Admin</p>
                    <p className="text-muted-foreground">Email: admin@gmail.com</p>
                    <p className="text-muted-foreground">Password: admin1</p>
                  </div>
                </div>
                
                {/* First Time Login Notice for Blood Managers */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-left">
                  <p className="text-xs text-blue-800">
                    <strong>Note for Blood Managers:</strong> If this is your first time accessing your account, 
                    please change your password under the Manager tab after logging in.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginForm;
