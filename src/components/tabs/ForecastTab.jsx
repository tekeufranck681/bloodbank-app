import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useForecastStore } from '@/stores/forecastStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { RefreshCw, AlertTriangle } from 'lucide-react';

// Import forecast components
import ForecastHeader from '@/components/forecast/ForecastHeader';
import ForecastSummaryCards from '@/components/forecast/ForecastSummaryCards';
import ForecastCharts from '@/components/forecast/ForecastCharts';
import ForecastDetails from '@/components/forecast/ForecastDetails';

const ForecastTab = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [selectedPeriod, setSelectedPeriod] = useState('1d');
  
  const { 
    latestForecast, 
    isLoading, 
    error, 
    fetchLatestForecast, 
    fetchCurrentDayPredictions,
    fetchNext7DaysPredictions
  } = useForecastStore();

  const handleRerunPrediction = async () => {
    try {
      if (selectedPeriod === '1d') {
        await fetchCurrentDayPredictions();
      } else {
        await fetchNext7DaysPredictions();
      }
      
      toast({
        title: 'Success',
        description: `${selectedPeriod === '1d' ? 'Daily' : 'Weekly'} prediction completed successfully`,
      });
      // The useEffect will automatically refetch the latest data
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Load data on component mount and period change
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchLatestForecast(selectedPeriod);
      } catch (error) {
        toast({
          title: 'Error Loading Forecast Data',
          description: error.message,
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [selectedPeriod, fetchLatestForecast, toast]);

  const handleRefresh = async () => {
    try {
      await fetchLatestForecast(selectedPeriod);
      toast({
        title: 'Success',
        description: 'Forecast data refreshed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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
          <p className="text-muted-foreground">Loading forecast data...</p>
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
            <p>Error loading forecast data: {error}</p>
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
        <ForecastHeader
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          onRefresh={handleRefresh}
          onRerunPrediction={handleRerunPrediction}
          isLoading={isLoading}
          isRerunning={isLoading} // Use same loading state
        />
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants}>
        <ForecastSummaryCards
          forecastData={latestForecast}
          selectedPeriod={selectedPeriod}
        />
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants}>
        <ForecastCharts
          forecastData={latestForecast}
          selectedPeriod={selectedPeriod}
          isMobile={isMobile}
        />
      </motion.div>

      {/* Detailed Forecast */}
      <motion.div variants={itemVariants}>
        <ForecastDetails
          forecastData={latestForecast}
          selectedPeriod={selectedPeriod}
        />
      </motion.div>
    </motion.div>
  );
};

export default ForecastTab;
