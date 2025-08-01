import React, { useState, useEffect } from 'react';
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
import { useDonorStore } from '@/stores/donorStore';
import { useDonationStore } from '@/stores/donationStore';
import { useStockStore } from '@/stores/stockStore';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DashboardTab = () => {
  const { toast } = useToast();
  
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

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchDonors(),
          fetchDonations(),
          fetchStocks()
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
  }, [fetchDonors, fetchDonations, fetchStocks, toast]);

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

  // Stock status distribution
  const stockStatusData = [
    { name: 'Available', value: filteredStocks.filter(s => s.status === 'available').length, color: '#10b981' },
    { name: 'Reserved', value: filteredStocks.filter(s => s.status === 'reserved').length, color: '#f59e0b' },
    { name: 'Used', value: filteredStocks.filter(s => s.status === 'used').length, color: '#6b7280' },
    { name: 'Expired', value: filteredStocks.filter(s => s.status === 'expired').length, color: '#ef4444' },
  ];

  // Recent donations (last 5)
  const recentDonations = filteredDonations
    .sort((a, b) => new Date(b.donation_date || b.created_at) - new Date(a.donation_date || a.created_at))
    .slice(0, 5);

  // Stock alerts (expired or near expiry)
  const stockAlerts = filteredStocks.filter(stock => {
    const expiryDate = new Date(stock.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return stock.status === 'expired' || daysUntilExpiry <= 7;
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
          donation.blood_type || 'Unknown',
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

  const isLoading = donorsLoading || donationsLoading || stocksLoading;
  const hasError = donorsError || donationsError || stocksError;

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
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
        <div className="flex flex-col gap-4 mb-6 px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Dashboard</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Overview of blood bank operations</p>
            </div>
            <Button 
              variant="outline"
              onClick={exportToPDF}
              className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-card mx-4 sm:mx-0">
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-1">
                <Label htmlFor="startDate" className="text-xs sm:text-sm font-medium">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-sm w-full"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endDate" className="text-xs sm:text-sm font-medium">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm w-full"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-medium">Blood Type</Label>
                <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                  <SelectTrigger className="text-sm w-full">
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
                  <SelectTrigger className="text-sm w-full">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 px-4 sm:px-0">
        <motion.div variants={itemVariants}>
          <Card className="border shadow-md bg-blue-500">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">Blood Managers</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{totalManagers}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border shadow-md bg-red-500">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">Total Donors</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{totalDonors}</p>
                </div>
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border shadow-md bg-green-500">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">Total Donations</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{totalDonations}</p>
                </div>
                <Droplet className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border shadow-md bg-purple-500">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">Available Stock</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{availableStock}</p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 px-4 sm:px-0">
        {/* Blood Type Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Blood Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bloodTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bloodType" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="donors" fill="hsl(var(--primary))" name="Donors" />
                  <Bar dataKey="stock" fill="hsl(var(--secondary))" name="Stock" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Status Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Stock Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Donations Trend */}
      {monthlyData.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Monthly Donations Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="donations" stroke="hsl(var(--primary))" name="Donations" />
                  <Line type="monotone" dataKey="volume" stroke="hsl(var(--secondary))" name="Volume (ml)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 px-4 sm:px-0">
        {/* Recent Donations */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Recent Donations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
                  <p className="text-muted-foreground text-center py-4 text-sm">No recent donations</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Alerts */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-status-near-expiry" />
                Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockAlerts.length > 0 ? (
                  stockAlerts.map((stock) => (
                    <div key={stock.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <BloodTypeBadge bloodType={stock.blood_type} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs sm:text-sm truncate">{stock.location || 'Unknown Location'}</p>
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(stock.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <StatusBadge status={stock.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4 text-sm">No stock alerts</p>
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
