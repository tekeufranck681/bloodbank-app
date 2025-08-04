import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useOptimizeStore } from '@/stores/optimizeStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertTriangle } from 'lucide-react';

// Import optimization components
import OptimizationHeader from '@/components/optimization/OptimizationHeader';
import OptimizationSummaryCards from '@/components/optimization/OptimizationSummaryCards';
import OptimizationCharts from '@/components/optimization/OptimizationCharts';
import OptimizationDetails from '@/components/optimization/OptimizationDetails';
import OptimizationCalculationInfo from '@/components/optimization/OptimizationCalculationInfo';

const OptimizationTab = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [selectedPeriod, setSelectedPeriod] = useState('1d');
  
  const { 
    latestOptimization, 
    isLoading, 
    error, 
    fetchLatestOptimization,
    fetchOptimization
  } = useOptimizeStore();

  const handleRerunOptimization = async () => {
    try {
      await fetchOptimization(selectedPeriod);
      await fetchLatestOptimization(selectedPeriod);
      
      toast({
        title: 'Success',
        description: `${selectedPeriod === '1d' ? 'Daily' : 'Weekly'} optimization completed successfully`,
      });
    } catch (error) {
      // Error handling is done in the service layer
    }
  };

  // Load data on component mount and period change
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchLatestOptimization(selectedPeriod);
      } catch (error) {
        // Error handling is done in the service layer
      }
    };

    loadData();
  }, [selectedPeriod, fetchLatestOptimization]);

  const handleRefresh = async () => {
    try {
      await fetchLatestOptimization(selectedPeriod);
      toast({
        title: 'Success',
        description: 'Optimization data refreshed successfully',
      });
    } catch (error) {
      // Error handling is done in the service layer
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
          <p className="text-muted-foreground">Loading optimization data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>Error loading optimization data: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header with Controls */}
      <motion.div variants={itemVariants}>
        <OptimizationHeader
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          onRefresh={handleRefresh}
          onRerunOptimization={handleRerunOptimization}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants}>
        <OptimizationSummaryCards
          optimizationData={latestOptimization}
          selectedPeriod={selectedPeriod}
        />
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants}>
        <OptimizationCharts
          optimizationData={latestOptimization}
          selectedPeriod={selectedPeriod}
          isMobile={isMobile}
        />
      </motion.div>

      {/* Calculation Info */}
      <motion.div variants={itemVariants}>
        <OptimizationCalculationInfo />
      </motion.div>

      {/* Details */}
      <motion.div variants={itemVariants}>
        <OptimizationDetails
          optimizationData={latestOptimization}
          selectedPeriod={selectedPeriod}
        />
      </motion.div>
    </motion.div>
  );
};

export default OptimizationTab;
