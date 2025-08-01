import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Lock, AlertTriangle, Calendar, Package, MapPin, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BloodTypeBadge, StatusBadge } from '@/components/ui/badge-status';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useStockStore } from '@/stores/stockStore';
import { StockStatusEnum, getExpiryStatus, getExpiryColor, EXPIRY_THRESHOLDS } from '@/constants/stockConstants';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StockManagementTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  
  const { toast } = useToast();
  
  // Store hooks
  const {
    stocks,
    isLoading,
    error,
    fetchStocks,
    reserveStock,
    makeStockAvailable,
    getFilteredStocks,
    setFilters,
    clearError
  } = useStockStore();

  // Fetch stocks on component mount
  useEffect(() => {
    fetchStocks();
  }, []);

  // Update store filters when local filters change
  useEffect(() => {
    setFilters({
      bloodType: bloodTypeFilter,
      status: statusFilter
    });
  }, [bloodTypeFilter, statusFilter, setFilters]);

  // Get filtered stocks
  const filteredStock = stocks.filter(stock => {
    const matchesSearch = searchTerm === '' || 
      stock.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stock.donation?.collection_site || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBloodType = bloodTypeFilter === 'all' || stock.blood_type === bloodTypeFilter;
    const matchesStatus = statusFilter === 'all' || stock.status === statusFilter;
    
    return matchesSearch && matchesBloodType && matchesStatus;
  });

  // Get unique blood types from actual data
  const bloodTypes = [...new Set(stocks.map(s => s.blood_type))].filter(Boolean);
  const statuses = Object.values(StockStatusEnum);

  const handleAction = async (action, stockId) => {
    try {
      switch (action) {
        case 'Reserve':
          await reserveStock(stockId);
          toast({
            title: 'Success',
            description: `Stock ${stockId} has been reserved.`,
          });
          break;
        case 'Make Available':
          await makeStockAvailable(stockId);
          toast({
            title: 'Success',
            description: `Stock ${stockId} is now available.`,
          });
          break;
        case 'View':
          const stock = stocks.find(s => s.id === stockId);
          setSelectedStock(stock);
          setViewModalOpen(true);
          break;
        default:
          toast({
            title: `${action} Stock`,
            description: `${action} action for stock ${stockId} would be implemented here.`,
          });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getExpiryProgress = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const totalDays = 42; // Typical blood storage period
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));
  };

  const getDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getExpiryBadge = (expiryDate) => {
    const daysLeft = getDaysLeft(expiryDate);
    const status = getExpiryStatus(expiryDate);
    
    if (daysLeft <= 0) {
      return <Badge className="bg-red-500 text-white">Expired</Badge>;
    } else if (daysLeft <= EXPIRY_THRESHOLDS.CRITICAL) {
      return <Badge className="bg-red-400 text-white">Critical ({daysLeft}d)</Badge>;
    } else if (daysLeft <= EXPIRY_THRESHOLDS.WARNING) {
      return <Badge className="bg-yellow-500 text-white">Warning ({daysLeft}d)</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white">Good ({daysLeft}d)</Badge>;
    }
  };

  const getExpiryStatusText = (expiryDate) => {
    const daysLeft = getDaysLeft(expiryDate);
    
    if (daysLeft <= 0) {
      return 'Expired';
    } else if (daysLeft <= EXPIRY_THRESHOLDS.CRITICAL) {
      return `Critical (${daysLeft}d)`;
    } else if (daysLeft <= EXPIRY_THRESHOLDS.WARNING) {
      return `Warning (${daysLeft}d)`;
    } else {
      return `Good (${daysLeft}d)`;
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Blood Stock Report', 20, 20);
      
      // Export date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 35);
      doc.text(`Total Records: ${filteredStock.length}`, 20, 45);
      
      // Applied filters info
      let filtersText = 'Applied Filters: ';
      const activeFilters = [];
      if (searchTerm) activeFilters.push(`Search: "${searchTerm}"`);
      if (bloodTypeFilter !== 'all') activeFilters.push(`Blood Type: ${bloodTypeFilter}`);
      if (statusFilter !== 'all') activeFilters.push(`Status: ${statusFilter}`);
      
      if (activeFilters.length > 0) {
        filtersText += activeFilters.join(', ');
      } else {
        filtersText += 'None';
      }
      
      doc.text(filtersText, 20, 55);
      
      // Table data
      const tableData = filteredStock.map(stock => [
        stock.id.slice(0, 12) + '...', // Truncate long IDs
        stock.blood_type || 'Unknown',
        `${stock.volume_ml}ml`,
        formatDate(stock.stored_date),
        formatDate(stock.expiry_date),
        getExpiryStatusText(stock.expiry_date),
        stock.status || 'Unknown'
      ]);
      
      // Table headers
      const headers = [
        'Unit ID',
        'Blood Type',
        'Volume',
        'Stored Date',
        'Expiry Date',
        'Expiry Status',
        'Status'
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
          0: { cellWidth: 25 }, // Unit ID
          1: { cellWidth: 20 }, // Blood Type
          2: { cellWidth: 18 }, // Volume
          3: { cellWidth: 25 }, // Stored Date
          4: { cellWidth: 25 }, // Expiry Date
          5: { cellWidth: 30 }, // Expiry Status
          6: { cellWidth: 25 }, // Status
        },
      });
      
      // Save the PDF
      const fileName = `blood-stock-report-${new Date().toISOString().split('T')[0]}.pdf`;
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Stock</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => { clearError(); fetchStocks(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold text-foreground">Stock Management</h2>
          <p className="text-muted-foreground">Monitor blood inventory and expiration dates</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => fetchStocks()}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Stock Statistics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-card bg-gradient-to-br from-green-500 to-green-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Available</p>
                <p className="text-2xl font-bold text-white">
                  {stocks.filter(s => s.status === StockStatusEnum.AVAILABLE).length}
                </p>
              </div>
              <Package className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-to-br from-blue-500 to-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Reserved</p>
                <p className="text-2xl font-bold text-white">
                  {stocks.filter(s => s.status === StockStatusEnum.RESERVED).length}
                </p>
              </div>
              <Lock className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-to-br from-yellow-500 to-yellow-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Near Expiry</p>
                <p className="text-2xl font-bold text-white">
                  {stocks.filter(s => s.status === StockStatusEnum.NEAR_TO_EXPIRY).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-to-br from-red-500 to-red-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Expired</p>
                <p className="text-2xl font-bold text-white">
                  {stocks.filter(s => s.status === StockStatusEnum.EXPIRED).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stock..."
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={exportToPDF}
              disabled={filteredStock.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Blood Stock ({filteredStock.length} units)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading stock...</p>
            </div>
          ) : filteredStock.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit ID</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Stored Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Expiry Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.map((stock) => {
                  const progress = getExpiryProgress(stock.expiry_date);
                  const daysLeft = getDaysLeft(stock.expiry_date);
                  
                  return (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">{stock.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <BloodTypeBadge bloodType={stock.blood_type} />
                      </TableCell>
                      <TableCell>{stock.volume_ml}ml</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formatDate(stock.stored_date)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(stock.expiry_date)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getExpiryBadge(stock.expiry_date)}
                          <Progress 
                            value={progress} 
                            className="h-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={stock.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction('View', stock.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {stock.status === StockStatusEnum.AVAILABLE && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction('Reserve', stock.id)}
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No stock found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || bloodTypeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding blood units to inventory'}
              </p>
              {!searchTerm && bloodTypeFilter === 'all' && statusFilter === 'all' && (
                <Button 
                  className="bg-gradient-medical hover:shadow-medical transition-all duration-300"
                  onClick={() => handleAction('Add', 'new')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Stock Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Stock Details
            </DialogTitle>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Unit ID</Label>
                  <p className="text-sm font-mono">{selectedStock.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Blood Type</Label>
                  <div className="mt-1">
                    <BloodTypeBadge bloodType={selectedStock.blood_type} />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Volume</Label>
                  <p className="text-sm">{selectedStock.volume_ml}ml</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <StatusBadge status={selectedStock.status} />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Stored Date</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(selectedStock.stored_date)}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Expiry Date</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(selectedStock.expiry_date)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Expiry Status</Label>
                <div className="mt-2 space-y-2">
                  {getExpiryBadge(selectedStock.expiry_date)}
                  <Progress 
                    value={getExpiryProgress(selectedStock.expiry_date)} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {getDaysLeft(selectedStock.expiry_date)} days remaining
                  </p>
                </div>
              </div>

              {selectedStock.donation && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Collection Site</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{selectedStock.donation.collection_site}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default StockManagementTab;
