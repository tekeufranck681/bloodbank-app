import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Header
      "bloodBankManagement": "Blood Bank Management",
      "login": "Login",
      "logout": "Logout",
      
      // Navigation
      "dashboard": "Dashboard",
      "bloodManagers": "Blood Managers",
      "donors": "Donors",
      "donations": "Donations",
      "stockManagement": "Stock Management",
      
      // Common actions
      "add": "Add",
      "edit": "Edit",
      "view": "View",
      "delete": "Delete",
      "search": "Search",
      "filter": "Filter",
      "export": "Export",
      "save": "Save",
      "cancel": "Cancel",
      
      // Login Form
      "email": "Email",
      "password": "Password",
      "selectRole": "Select Role",
      "admin": "Admin",
      "bloodManager": "Blood Manager",
      "signIn": "Sign In",
      "signingIn": "Signing in...",
      "enterEmail": "Enter your email",
      "enterPassword": "Enter your password",
      "enterCredentials": "Enter your credentials to access the system",
      "welcomeMessage": "Welcome to Blood Bank Management System!",
      "checkCredentials": "Please check your credentials and try again.",
      
      // Blood types
      "bloodType": "Blood Type",
      "bloodTypes": "Blood Types",
      
      // Status
      "status": "Status",
      "available": "Available",
      "reserved": "Reserved",
      "nearExpiry": "Near Expiry",
      "expired": "Expired",
      "active": "Active",
      "inactive": "Inactive",
      
      // Dashboard
      "totalDonors": "Total Donors",
      "totalDonations": "Total Donations",
      "totalVolume": "Total Volume",
      "stockUnits": "Stock Units",
      "recentDonations": "Recent Donations",
      "stockAlerts": "Stock Alerts",
      
      // Messages
      "loginSuccessful": "Login Successful",
      "loginFailed": "Login Failed",
      "loggedOut": "Logged Out",
      "noDataFound": "No data found",
      "loading": "Loading...",
      
      // Manager specific
      "manageBloodBankStaff": "Manage blood bank staff and administrators",
      "searchManagersPlaceholder": "Search managers by name, email, or phone...",
      "viewManager": "View Manager",
      "editManager": "Edit Manager",
      "deleteManager": "Delete Manager",
      "addManager": "Add Manager",
      "viewing": "Viewing",
      "editing": "Editing",
      "deleteAction": "Delete action for",
      "wouldBeImplemented": "would be implemented here",
      "addManagerWouldBeImplemented": "Add manager functionality would be implemented here",
      "errorLoadingManagers": "Error Loading Managers",
      "retry": "Retry",
      "noName": "No Name",
      "joined": "Joined",
      "noManagersFound": "No managers found",
      "tryAdjustingSearch": "Try adjusting your search criteria",
      "getStartedAddingManager": "Get started by adding your first blood manager",
      "adminOnlyFeature": "This feature is only available to administrators",
      "managerDetails": "Manager Details",
      "addNewManager": "Add New Manager",
      "fullName": "Full Name",
      "enterFullName": "Enter full name",
      "enterEmail": "Enter email address",
      "phoneNumber": "Phone Number",
      "enterPhoneNumber": "Enter phone number",
      "enterPassword": "Enter password",
      "confirmPassword": "Confirm Password",
      "joinDate": "Join Date",
      "managerId": "Manager ID",
      "fullNameRequired": "Full name is required",
      "emailRequired": "Email is required",
      "emailInvalid": "Please enter a valid email address",
      "phoneRequired": "Phone number is required",
      "passwordRequired": "Password is required",
      "passwordMinLength": "Password must be at least 6 characters",
      "passwordsDoNotMatch": "Passwords do not match",
      "registering": "Registering...",
      "registerManager": "Register Manager",
      "managerRegisteredSuccessfully": "Manager registered successfully",
      "cancel": "Cancel",
      
      // New translations
      "you": "You",
      "welcome": "Welcome",
      "accessDenied": "Access Denied",
      "canOnlyEditOwnProfile": "You can only edit your own profile",
      "loggedOutSuccessfully": "You have been successfully logged out",
      "editProfile": "Edit Profile",
      "newPassword": "New Password",
      "optional": "Optional",
      "enterNewPassword": "Enter new password (leave blank to keep current)",
      "confirmNewPassword": "Confirm New Password",
      "updating": "Updating...",
      "updateProfile": "Update Profile",
      "profileUpdatedSuccessfully": "Profile updated successfully",
      "noChanges": "No Changes",
      "noChangesToSave": "No changes to save",

      // Donor specific translations
      "donors": "Donors",
      "manageDonors": "Manage blood donors and their information",
      "searchDonorsPlaceholder": "Search donors by name, email, phone, or location...",
      "addDonor": "Add Donor",
      "viewDonor": "View Donor",
      "editDonor": "Edit Donor",
      "deleteDonor": "Delete Donor",
      "updateDonor": "Update Donor",
      "donorDetails": "Donor Details",
      "addNewDonor": "Add New Donor",
      "editDonorInfo": "Edit Donor Information",
      "donorRegisteredSuccessfully": "Donor registered successfully",
      "donorUpdatedSuccessfully": "Donor updated successfully",
      "donorDeletedSuccessfully": "Donor deleted successfully",
      "confirmDeleteDonor": "Are you sure you want to delete this donor?",
      "noDonorsFound": "No donors found",
      "errorLoadingDonors": "Error Loading Donors",
      "failedToCreateDonor": "Failed to create donor",
      "failedToUpdateDonor": "Failed to update donor",
      "failedToDeleteDonor": "Failed to delete donor",

      // Donor form fields
      "donorFullName": "Full Name",
      "donorEmail": "Email Address",
      "donorPhone": "Phone Number",
      "donorGender": "Gender",
      "donorAge": "Age",
      "donorBloodType": "Blood Type",
      "donorLocation": "Location",
      "donorEligibility": "Eligibility Status",
      "isEligible": "Is Eligible",
      "notEligible": "Not Eligible",
      "eligible": "Eligible",
      "male": "Male",
      "female": "Female",

      // Donor form placeholders
      "enterDonorName": "Enter donor's full name",
      "enterDonorEmail": "Enter email address (optional)",
      "enterDonorPhone": "Enter phone number (optional)",
      "selectGender": "Select gender",
      "enterAge": "Enter age (18-65)",
      "selectBloodType": "Select blood type",
      "enterLocation": "Enter location (optional)",
      "selectEligibility": "Select eligibility status",

      // Donor form validation
      "donorNameRequired": "Donor name is required",
      "donorEmailRequired": "Email is required",
      "donorPhoneRequired": "Phone number is required",
      "donorLocationRequired": "Location is required",
      "donorGenderRequired": "Gender is required",
      "donorAgeRequired": "Age is required",
      "donorAgeInvalid": "Age must be between 18 and 65",
      "donorBloodTypeRequired": "Blood type is required",
      "donorEmailInvalid": "Please enter a valid email address",

      // Donor statistics
      "totalDonors": "Total Donors",
      "eligibleDonors": "Eligible Donors",
      "ineligibleDonors": "Ineligible Donors",
      "donorsByBloodType": "Donors by Blood Type",
      "donorsByGender": "Donors by Gender",

      // Donor actions
      "toggleEligibility": "Toggle Eligibility",
      "markAsEligible": "Mark as Eligible",
      "markAsIneligible": "Mark as Ineligible",
      "donorEligibilityUpdated": "Donor eligibility updated successfully",

      // Donor filters
      "filterByEligibility": "Filter by Eligibility",
      "filterByBloodType": "Filter by Blood Type",
      "filterByGender": "Filter by Gender",
      "allEligibilityStatuses": "All Eligibility Statuses",
      "allBloodTypes": "All Blood Types",
      "allGenders": "All Genders",

      // Donor info display
      "donorId": "Donor ID",
      "registrationDate": "Registration Date",
      "lastUpdated": "Last Updated",
      "contactInformation": "Contact Information",
      "medicalInformation": "Medical Information",
      "personalInformation": "Personal Information"
    }
  },
  fr: {
    translation: {
      // Header
      "bloodBankManagement": "Gestion de Banque de Sang",
      "login": "Connexion",
      "logout": "Déconnexion",
      
      // Navigation
      "dashboard": "Tableau de Bord",
      "bloodManagers": "Gestionnaires de Sang",
      "donors": "Donneurs",
      "donations": "Dons",
      "stockManagement": "Gestion des Stocks",
      
      // Common actions
      "add": "Ajouter",
      "edit": "Modifier",
      "view": "Voir",
      "delete": "Supprimer",
      "search": "Rechercher",
      "filter": "Filtrer",
      "export": "Exporter",
      "save": "Enregistrer",
      "cancel": "Annuler",
      
      // Login Form
      "email": "Email",
      "password": "Mot de passe",
      "selectRole": "Sélectionner le rôle",
      "admin": "Administrateur",
      "bloodManager": "Gestionnaire de Sang",
      "signIn": "Se connecter",
      "signingIn": "Connexion en cours...",
      "enterEmail": "Entrez votre email",
      "enterPassword": "Entrez votre mot de passe",
      "enterCredentials": "Entrez vos identifiants pour accéder au système",
      "welcomeMessage": "Bienvenue dans le Système de Gestion de Banque de Sang !",
      "checkCredentials": "Veuillez vérifier vos identifiants et réessayer.",
      
      // Blood types
      "bloodType": "Groupe Sanguin",
      "bloodTypes": "Groupes Sanguins",
      
      // Status
      "status": "Statut",
      "available": "Disponible",
      "reserved": "Réservé",
      "nearExpiry": "Proche Expiration",
      "expired": "Expiré",
      "active": "Actif",
      "inactive": "Inactif",
      
      // Dashboard
      "totalDonors": "Total Donneurs",
      "totalDonations": "Total Dons",
      "totalVolume": "Volume Total",
      "stockUnits": "Unités en Stock",
      "recentDonations": "Dons Récents",
      "stockAlerts": "Alertes de Stock",
      
      // Messages
      "loginSuccessful": "Connexion Réussie",
      "loginFailed": "Échec de Connexion",
      "loggedOut": "Déconnecté",
      "noDataFound": "Aucune donnée trouvée",
      "loading": "Chargement...",
      
      // Manager specific
      "manageBloodBankStaff": "Gérer le personnel et les administrateurs de la banque de sang",
      "searchManagersPlaceholder": "Rechercher des gestionnaires par nom, email ou téléphone...",
      "viewManager": "Voir le Gestionnaire",
      "editManager": "Modifier le Gestionnaire",
      "deleteManager": "Supprimer le Gestionnaire",
      "addManager": "Ajouter un Gestionnaire",
      "viewing": "Visualisation de",
      "editing": "Modification de",
      "deleteAction": "Action de suppression pour",
      "wouldBeImplemented": "serait implémentée ici",
      "addManagerWouldBeImplemented": "La fonctionnalité d'ajout de gestionnaire serait implémentée ici",
      "errorLoadingManagers": "Erreur de Chargement des Gestionnaires",
      "retry": "Réessayer",
      "noName": "Aucun Nom",
      "joined": "Rejoint le",
      "noManagersFound": "Aucun gestionnaire trouvé",
      "tryAdjustingSearch": "Essayez d'ajuster vos critères de recherche",
      "getStartedAddingManager": "Commencez par ajouter votre premier gestionnaire de sang",
      "error": "Erreur",
      
      // New translations
      "you": "Vous",
      "welcome": "Bienvenue",
      "accessDenied": "Accès Refusé",
      "canOnlyEditOwnProfile": "Vous ne pouvez modifier que votre propre profil",
      "loggedOutSuccessfully": "Vous avez été déconnecté avec succès",
      "editProfile": "Modifier le Profil",
      "newPassword": "Nouveau Mot de Passe",
      "optional": "Optionnel",
      "enterNewPassword": "Entrez le nouveau mot de passe (laissez vide pour conserver l'actuel)",
      "confirmNewPassword": "Confirmer le Nouveau Mot de Passe",
      "updating": "Mise à jour...",
      "updateProfile": "Mettre à Jour le Profil",
      "profileUpdatedSuccessfully": "Profil mis à jour avec succès",
      "noChanges": "Aucun Changement",
      "noChangesToSave": "Aucun changement à sauvegarder",

      // Donor specific translations
      "donors": "Donneurs",
      "manageDonors": "Gérer les donneurs de sang et leurs informations",
      "searchDonorsPlaceholder": "Rechercher des donneurs par nom, email, téléphone ou lieu...",
      "addDonor": "Ajouter un Donneur",
      "viewDonor": "Voir le Donneur",
      "editDonor": "Modifier le Donneur",
      "deleteDonor": "Supprimer le Donneur",
      "updateDonor": "Mettre à Jour le Donneur",
      "donorDetails": "Détails du Donneur",
      "addNewDonor": "Ajouter un Nouveau Donneur",
      "editDonorInfo": "Modifier les Informations du Donneur",
      "donorRegisteredSuccessfully": "Donneur enregistré avec succès",
      "donorUpdatedSuccessfully": "Donneur mis à jour avec succès",
      "donorDeletedSuccessfully": "Donneur supprimé avec succès",
      "confirmDeleteDonor": "Êtes-vous sûr de vouloir supprimer ce donneur?",
      "noDonorsFound": "Aucun donneur trouvé",
      "errorLoadingDonors": "Erreur de Chargement des Donneurs",
      "failedToCreateDonor": "Échec de création du donneur",
      "failedToUpdateDonor": "Échec de mise à jour du donneur",
      "failedToDeleteDonor": "Échec de suppression du donneur",

      // Donor form fields
      "donorFullName": "Full Name",
      "donorEmail": "Email Address",
      "donorPhone": "Phone Number",
      "donorGender": "Gender",
      "donorAge": "Age",
      "donorBloodType": "Blood Type",
      "donorLocation": "Location",
      "donorEligibility": "Eligibility Status",
      "isEligible": "Is Eligible",
      "notEligible": "Not Eligible",
      "eligible": "Eligible",
      "male": "Male",
      "female": "Female",

      // Donor form placeholders
      "enterDonorName": "Enter donor's full name",
      "enterDonorEmail": "Enter email address (optional)",
      "enterDonorPhone": "Enter phone number (optional)",
      "selectGender": "Select gender",
      "enterAge": "Enter age (18-65)",
      "selectBloodType": "Select blood type",
      "enterLocation": "Enter location (optional)",
      "selectEligibility": "Select eligibility status",

      // Donor form validation
      "donorNameRequired": "Donor name is required",
      "donorEmailRequired": "Email is required",
      "donorPhoneRequired": "Phone number is required",
      "donorLocationRequired": "Location is required",
      "donorGenderRequired": "Gender is required",
      "donorAgeRequired": "Age is required",
      "donorAgeInvalid": "Age must be between 18 and 65",
      "donorBloodTypeRequired": "Blood type is required",
      "donorEmailInvalid": "Please enter a valid email address",

      // Donor statistics
      "totalDonors": "Total Donors",
      "eligibleDonors": "Eligible Donors",
      "ineligibleDonors": "Ineligible Donors",
      "donorsByBloodType": "Donors by Blood Type",
      "donorsByGender": "Donors by Gender",

      // Donor actions
      "toggleEligibility": "Toggle Eligibility",
      "markAsEligible": "Mark as Eligible",
      "markAsIneligible": "Mark as Ineligible",
      "donorEligibilityUpdated": "Donor eligibility updated successfully",

      // Donor filters
      "filterByEligibility": "Filter by Eligibility",
      "filterByBloodType": "Filter by Blood Type",
      "filterByGender": "Filter by Gender",
      "allEligibilityStatuses": "All Eligibility Statuses",
      "allBloodTypes": "All Blood Types",
      "allGenders": "All Genders",

      // Donor info display
      "donorId": "Donor ID",
      "registrationDate": "Registration Date",
      "lastUpdated": "Last Updated",
      "contactInformation": "Contact Information",
      "medicalInformation": "Medical Information",
      "personalInformation": "Personal Information"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false // React already does escaping
    }
  });

export default i18n;
