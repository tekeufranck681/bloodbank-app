
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Droplet, Package, TrendingUp, AlertTriangle, Calendar, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { BloodTypeBadge, StatusBadge } from '@/components/ui/badge-status';
import { Badge } from '@/components/ui/badge';
import { useDonorStore } from '@/stores/donorStore';
import { useDonationStore } from '@/stores/donationStore';
import { useStockStore } from '@/stores/stockStore';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useIsMobile } from '@/hooks/use-mobile';
import { useForecastStore } from '@/stores/forecastStore';
import { useOptimizeStore } from '@/stores/optimizeStore';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import SummaryCardsSkeleton from '@/components/dashboard/SummaryCardsSkeleton';

// Lazy load heavy components
const ForecastSummaryCard = lazy(() => import('@/components/dashboard/ForecastSummaryCard'));
const OptimizationSummaryCard = lazy(() => import('@/components/dashboard/OptimizationSummaryCard'));
const CombinedAnalyticsCard = lazy(() => import('@/components/dashboard/CombinedAnalyticsCard'));
const ChartsSection = lazy(() => import('@/components/dashboard/ChartsSection'));

const DashboardTab = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  
  // Store hooks
  const {
    donors,
    isLoading: donorsLoading,
    error: donorsError,
    fetchDonors,
    getDonorsStats
  } = useDonorStore();

  const {
    donations,
    isLoading: donationsLoading,
    error: donationsError,
    fetchDonations
  } = useDonationStore();

  const {
    stocks,
    isLoading: stocksLoading,
    error: stocksError,
    fetchStocks,
    getStockStats
  } = useStockStore();

  // Add forecast and optimization stores
  const {
    latestForecast,
    isLoading: forecastLoading,
    error: forecastError,
    fetchLatestForecast
  } = useForecastStore();

  const {
    latestOptimization,
    isLoading: optimizationLoading,
    error: optimizationError,
    fetchLatestOptimization
  } = useOptimizeStore();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchDonors(),
          fetchDonations(),
          fetchStocks(),
          fetchLatestForecast('1d'), // Default to daily forecast
          fetchLatestOptimization('1d') // Default to daily optimization
        ]);
      } catch (error) {
        toast({
          title: 'Error Loading Dashboard Data',
          description: error.message,
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [fetchDonors, fetchDonations, fetchStocks, fetchLatestForecast, fetchLatestOptimization, toast]);

  // Calculate filtered data based on current filters
  const getFilteredData = () => {
    let filteredDonations = donations;
    let filteredStocks = stocks;
    let filteredDonors = donors;

    // Date filtering for donations
    if (startDate || endDate) {
      filteredDonations = donations.filter(donation => {
        const donationDate = new Date(donation.donation_date || donation.created_at);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        return donationDate >= start && donationDate <= end;
      });
    }

    // Blood type filtering
    if (bloodTypeFilter !== 'all') {
      filteredDonations = filteredDonations.filter(d => d.blood_type === bloodTypeFilter);
      filteredStocks = filteredStocks.filter(s => s.blood_type === bloodTypeFilter);
      filteredDonors = filteredDonors.filter(d => d.blood_type === bloodTypeFilter);
    }

    // Location filtering
    if (locationFilter !== 'all') {
      filteredDonations = filteredDonations.filter(d => d.collection_site === locationFilter);
      filteredStocks = filteredStocks.filter(s => s.location === locationFilter);
    }

    return { filteredDonations, filteredStocks, filteredDonors };
  };

  const { filteredDonations, filteredStocks, filteredDonors } = getFilteredData();

  // Calculate summary statistics
  const totalDonors = filteredDonors.length;
  const totalDonations = filteredDonations.length;
  const totalVolume = filteredDonations.reduce((sum, donation) => sum + (donation.volume_ml || 0), 0);
  const availableStock = filteredStocks.filter(s => s.status === 'available').length;
  const nearExpiryStock = filteredStocks.filter(s => s.status === 'near to expiry').length;
  const expiredStock = filteredStocks.filter(s => s.status === 'expired').length;
  const reservedStock = filteredStocks.filter(s => s.status === 'reserved').length;
  const totalStock = filteredStocks.length;
  const totalManagers = donors.length; // Replace with actual managers count when available

  // Get unique values for filters
  const bloodTypes = [...new Set([
    ...donors.map(d => d.blood_type),
    ...donations.map(d => d.blood_type),
    ...stocks.map(s => s.blood_type)
  ])].filter(Boolean);

  const locations = [...new Set([
    ...donations.map(d => d.collection_site),
    ...stocks.map(s => s.location)
  ])].filter(Boolean);

  // Blood type distribution data for charts
  const bloodTypeData = bloodTypes.map(type => ({
    bloodType: type,
    donors: filteredDonors.filter(donor => donor.blood_type === type).length,
    stock: filteredStocks.filter(stock => stock.blood_type === type).length,
  }));

  // Monthly donations data from real data
  const getMonthlyData = () => {
    const monthlyStats = {};
    
    filteredDonations.forEach(donation => {
      const date = new Date(donation.donation_date || donation.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthName,
          donations: 0,
          volume: 0
        };
      }
      
      monthlyStats[monthKey].donations += 1;
      monthlyStats[monthKey].volume += donation.volume_ml || 0;
    });

    return Object.values(monthlyStats).slice(-6); // Last 6 months
  };

  const monthlyData = getMonthlyData();

  // Stock status distribution - use real data from store
  const stockStatusData = [
    { name: 'Available', value: filteredStocks.filter(s => s.status === 'available').length, color: '#10b981' },
    { name: 'Reserved', value: filteredStocks.filter(s => s.status === 'reserved').length, color: '#f59e0b' },
    { name: 'Near to Expiry', value: filteredStocks.filter(s => s.status === 'near to expiry').length, color: '#f97316' },
    { name: 'Expired', value: filteredStocks.filter(s => s.status === 'expired').length, color: '#ef4444' },
  ];

  // Recent donations (last 5)
  const recentDonations = filteredDonations
    .sort((a, b) => new Date(b.donation_date || b.created_at) - new Date(a.donation_date || a.created_at))
    .slice(0, 5);

  // Stock alerts (expired or near expiry) - use real status from data
  const stockAlerts = filteredStocks.filter(stock => {
    return stock.status === 'expired' || stock.status === 'near to expiry';
  });

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Dashboard Report', 20, 20);
      
      // Export date and filters
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 35);
      
      // Applied filters
      let filtersText = 'Applied Filters: ';
      const activeFilters = [];
      if (startDate) activeFilters.push(`Start Date: ${startDate}`);
      if (endDate) activeFilters.push(`End Date: ${endDate}`);
      if (bloodTypeFilter !== 'all') activeFilters.push(`Blood Type: ${bloodTypeFilter}`);
      if (locationFilter !== 'all') activeFilters.push(`Location: ${locationFilter}`);
      
      if (activeFilters.length > 0) {
        filtersText += activeFilters.join(', ');
      } else {
        filtersText += 'None';
      }
      
      doc.text(filtersText, 20, 45);
      
      // Summary statistics
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', 20, 65);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Donors: ${totalDonors}`, 20, 80);
      doc.text(`Total Donations: ${totalDonations}`, 20, 90);
      doc.text(`Total Volume: ${(totalVolume / 1000).toFixed(1)}L`, 20, 100);
      doc.text(`Total Stock Units: ${totalStock}`, 20, 110);
      
      // Blood type distribution table
      if (bloodTypeData.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Blood Type Distribution', 20, 130);
        
        const bloodTypeTableData = bloodTypeData.map(item => [
          item.bloodType,
          item.donors.toString(),
          item.stock.toString()
        ]);
        
        autoTable(doc, {
          head: [['Blood Type', 'Donors', 'Stock Units']],
          body: bloodTypeTableData,
          startY: 140,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
        });
      }
      
      // Recent donations table
      if (recentDonations.length > 0) {
        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 180;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Recent Donations', 20, finalY);
        
        const recentDonationsData = recentDonations.map(donation => [
          donation.donor?.full_name || 
          donors.find(d => d.id === donation.donor_id)?.full_name || 
          'Unknown',
          donation.blood_type || 
          donors.find(d => d.id === donation.donor_id)?.blood_type || 
          'Unknown',
          `${donation.volume_ml || 0}ml`,
          new Date(donation.donation_date || donation.created_at).toLocaleDateString()
        ]);
        
        autoTable(doc, {
          head: [['Donor', 'Blood Type', 'Volume', 'Date']],
          body: recentDonationsData,
          startY: finalY + 10,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
        });
      }
      
      // Save the PDF
      const fileName = `dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: 'Success',
        description: `Dashboard report exported successfully as ${fileName}`,
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate dashboard report',
        variant: 'destructive',
      });
    }
  };

  const isLoading = donorsLoading || donationsLoading || stocksLoading || forecastLoading || optimizationLoading;
  const hasError = donorsError || donationsError || stocksError || forecastError || optimizationError;

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

  // Show skeleton while initial data is loading
  if (donorsLoading && donationsLoading && stocksLoading) {
    return <DashboardSkeleton />;
  }

  if (hasError) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>Error loading dashboard data: {donorsError || donationsError || stocksError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function for screening result badges
  const getScreeningBadge = (result) => {
    if (!result) return <Badge variant="secondary">Pending</Badge>;
    
    const getScreeningResultColor = (result) => {
      switch (result) {
        case 'passed':
        case 'safe':
          return 'success';
        case 'failed':
        case 'unsafe':
          return 'destructive';
        case 'pending':
          return 'warning';
        default:
          return 'secondary';
      }
    };
    
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header with Filters */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col gap-4 mb-4 sm:mb-6 px-2 sm:px-4 lg:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">Dashboard</h2>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">Overview of blood bank operations</p>
            </div>
            <Button 
              variant="outline"
              onClick={exportToPDF}
              className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0 h-9 sm:h-10 text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Export Report</span>
              <span className="xs:hidden">Export</span>
            </Button>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="border-0 shadow-card mx-2 sm:mx-4 lg:mx-0 mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Filter className="h-4 w-4 text-primary" />
              <h3 className="text-sm sm:text-base font-medium">Filters</h3>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-medium">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs sm:text-sm w-full h-9 sm:h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-medium">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs sm:text-sm w-full h-9 sm:h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-medium">Blood Type</Label>
                <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                  <SelectTrigger className="text-xs sm:text-sm w-full h-9 sm:h-10">
                    <SelectValue placeholder="All Blood Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blood Types</SelectItem>
                    {bloodTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-medium">Location</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="text-xs sm:text-sm w-full h-9 sm:h-10">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 px-2 sm:px-4 lg:px-0 mb-4 sm:mb-6">
        <motion.div variants={itemVariants}>
          <Card className="border shadow-md bg-blue-500">
            <CardContent className="p-2 sm:p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">Blood Managers</p>
                  <p className="text-base sm:text-lg lg:text-2xl font-bold text-white">{totalManagers}</p>
                </div>
                <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border shadow-md bg-red-500">
            <CardContent className="p-2 sm:p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">Total Donors</p>
                  <p className="text-base sm:text-lg lg:text-2xl font-bold text-white">{totalDonors}</p>
                </div>
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border shadow-md bg-green-500">
            <CardContent className="p-2 sm:p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">Total Donations</p>
                  <p className="text-base sm:text-lg lg:text-2xl font-bold text-white">{totalDonations}</p>
                </div>
                <Droplet className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border shadow-md bg-purple-500">
            <CardContent className="p-2 sm:p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">Available Stock</p>
                  <p className="text-base sm:text-lg lg:text-2xl font-bold text-white">{availableStock}</p>
                </div>
                <Package className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Forecast, Optimization & Analytics Row */}
      <Suspense fallback={<SummaryCardsSkeleton />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-4 lg:px-0 mb-4 sm:mb-6">
          {/* Forecast Summary */}
          <motion.div variants={itemVariants}>
            <ForecastSummaryCard 
              forecastData={latestForecast}
              selectedPeriod="1d"
            />
          </motion.div>

          {/* Optimization Summary */}
          <motion.div variants={itemVariants}>
            <OptimizationSummaryCard 
              optimizationData={latestOptimization}
              selectedPeriod="1d"
            />
          </motion.div>

          {/* Combined Analytics */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1">
            <CombinedAnalyticsCard 
              forecastData={latestForecast}
              optimizationData={latestOptimization}
              stockData={filteredStocks}
              selectedPeriod="1d"
            />
          </motion.div>
        </div>
      </Suspense>

      {/* Charts Row */}
      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-4 lg:px-0 mb-4 sm:mb-6">
          {[1, 2].map((i) => (
            <Card key={i} className="border-0 shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 sm:h-5 sm:w-5 bg-muted animate-pulse rounded" />
                  <div className="h-4 sm:h-5 w-32 sm:w-40 bg-muted animate-pulse rounded" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48 sm:h-56 lg:h-64 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <div className="px-2 sm:px-4 lg:px-0 mb-4 sm:mb-6">
          <ChartsSection
            bloodTypeData={bloodTypeData}
            stockStatusData={stockStatusData}
            monthlyData={monthlyData}
            isMobile={isMobile}
            itemVariants={itemVariants}
          />
        </div>
      </Suspense>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-4 lg:px-0">
        {/* Recent Donations */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Recent Donations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-2 sm:space-y-3">
                {recentDonations.length > 0 ? (
                  recentDonations.map((donation) => (
                    <div key={donation.donation_id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <BloodTypeBadge 
                          bloodType={donation.blood_type || 
                                    donors.find(d => d.id === donation.donor_id)?.blood_type || 
                                    'Unknown'} 
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs sm:text-sm truncate">
                            {donation.donor?.full_name || 
                             donors.find(d => d.id === donation.donor_id)?.full_name || 
                             'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(donation.donation_date || donation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-medium text-xs sm:text-sm">{donation.volume_ml || 0}ml</p>
                        <div className="mt-1">
                          {getScreeningBadge(donation.screening_result)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4 text-xs sm:text-sm">No recent donations</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Alerts */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-status-near-expiry" />
                Stock Alerts
                {stockAlerts.length > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {stockAlerts.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-2 sm:space-y-3">
                {stockAlerts.length > 0 ? (
                  <>
                    {/* Priority Summary */}
                    <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                        <p className="text-xs text-red-600 font-medium">Expired</p>
                        <p className="text-sm sm:text-lg font-bold text-red-700">
                          {stockAlerts.filter(s => s.status === 'expired').length}
                        </p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
                        <p className="text-xs text-orange-600 font-medium">Near Expiry</p>
                        <p className="text-sm sm:text-lg font-bold text-orange-700">
                          {stockAlerts.filter(s => s.status === 'near to expiry').length}
                        </p>
                      </div>
                    </div>

                    {/* Alert Items */}
                    <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-2">
                      {stockAlerts
                        .sort((a, b) => {
                          if (a.status === 'expired' && b.status !== 'expired') return -1;
                          if (b.status === 'expired' && a.status !== 'expired') return 1;
                          return new Date(a.expiry_date) - new Date(b.expiry_date);
                        })
                        .map((stock) => {
                          const daysUntilExpiry = Math.ceil(
                            (new Date(stock.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
                          );
                          const isExpired = stock.status === 'expired';
                          
                          return (
                            <div 
                              key={stock.id} 
                              className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 rounded-lg border-l-4 gap-2 sm:gap-0 ${
                                isExpired 
                                  ? 'bg-red-50 border-l-red-500 border border-red-200' 
                                  : 'bg-orange-50 border-l-orange-500 border border-orange-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <BloodTypeBadge bloodType={stock.blood_type} />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium text-xs sm:text-sm truncate">
                                      {stock.location || 'Unknown Location'}
                                    </p>
                                    {isExpired && (
                                      <Badge variant="destructive" className="text-xs">
                                        EXPIRED
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {isExpired 
                                        ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                                        : `Expires in ${daysUntilExpiry} days`
                                      }
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Unit ID: {stock.id.slice(0, 8)}... • {stock.volume_ml || 450}ml
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1 flex-shrink-0">
                                <StatusBadge status={stock.status} />
                                <div className="flex gap-1">
                                  {isExpired ? (
                                    <Button 
                                      size="sm" 
                                      variant="destructive" 
                                      className="h-6 px-2 text-xs"
                                      onClick={() => {
                                        toast({
                                          title: 'Action Required',
                                          description: `Remove expired unit ${stock.id.slice(0, 8)}`,
                                          variant: 'destructive'
                                        });
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-6 px-2 text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
                                      onClick={() => {
                                        toast({
                                          title: 'Priority Use',
                                          description: `Mark unit ${stock.id.slice(0, 8)} for priority use`,
                                          variant: 'default'
                                        });
                                      }}
                                    >
                                      Priority
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs"
                        onClick={() => {
                          const expiredCount = stockAlerts.filter(s => s.status === 'expired').length;
                          toast({
                            title: 'Bulk Action',
                            description: `Process ${expiredCount} expired units for removal`,
                            variant: 'default'
                          });
                        }}
                      >
                        Process Expired ({stockAlerts.filter(s => s.status === 'expired').length})
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs"
                        onClick={() => {
                          const nearExpiryCount = stockAlerts.filter(s => s.status === 'near to expiry').length;
                          toast({
                            title: 'Priority Distribution',
                            description: `Mark ${nearExpiryCount} units for priority distribution`,
                            variant: 'default'
                          });
                        }}
                      >
                        Priority Use ({stockAlerts.filter(s => s.status === 'near to expiry').length})
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 sm:py-6">
                    <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                      <Package className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-green-800 mb-1">All Stock Healthy</p>
                    <p className="text-xs text-green-600">No expired or near-expiry alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardTab;
