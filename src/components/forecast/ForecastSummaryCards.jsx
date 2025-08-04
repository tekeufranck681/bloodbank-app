import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Activity, TrendingUp, Clock } from 'lucide-react';

const ForecastSummaryCards = ({ forecastData, selectedPeriod }) => {
  // Add debug logging
  console.log('ForecastSummaryCards - forecastData:', forecastData);
  console.log('ForecastSummaryCards - selectedPeriod:', selectedPeriod);

  if (!forecastData) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 px-4 sm:px-0">
        {[1,2,3,4].map(i => (
          <Card key={i} className="border shadow-md bg-gray-400">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-center">
                <p className="text-white text-sm">No data available</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const calculateSummary = () => {
    try {
      if (selectedPeriod === '1d') {
        // Daily forecast data structure: { "A+": 1302.98, "A-": 1460.20, ... }
        if (typeof forecastData !== 'object' || Array.isArray(forecastData)) {
          console.error('Expected object for 1d data, got:', typeof forecastData);
          return { totalPredicted: 0, averageDaily: 0, highestDemand: 'N/A', period: '1 Day' };
        }

        const bloodTypes = Object.keys(forecastData);
        const values = Object.values(forecastData).filter(val => typeof val === 'number' && !isNaN(val));
        
        if (values.length === 0) {
          return { totalPredicted: 0, averageDaily: 0, highestDemand: 'N/A', period: '1 Day' };
        }

        const totalPredicted = values.reduce((sum, val) => sum + val, 0);
        const averagePerType = totalPredicted / values.length;
        const highestDemand = Object.entries(forecastData).reduce(
          (max, [type, val]) => (typeof val === 'number' && val > max.value) ? { type, value: val } : max, 
          { type: 'N/A', value: 0 }
        );

        return {
          totalPredicted: Math.round(totalPredicted),
          averageDaily: Math.round(totalPredicted),
          highestDemand: highestDemand.type,
          period: '1 Day'
        };
      } else {
        // Weekly forecast data structure: [{ date, blood_type, predicted_volume }, ...]
        if (!Array.isArray(forecastData)) {
          console.error('Expected array for 7d data, got:', typeof forecastData);
          return { totalPredicted: 0, averageDaily: 0, highestDemand: 'N/A', period: '7 Days' };
        }

        const validData = forecastData.filter(item => 
          item && 
          typeof item.predicted_volume === 'number' && 
          !isNaN(item.predicted_volume)
        );

        if (validData.length === 0) {
          return { totalPredicted: 0, averageDaily: 0, highestDemand: 'N/A', period: '7 Days' };
        }

        const totalPredicted = validData.reduce((sum, item) => sum + item.predicted_volume, 0);
        const uniqueDates = [...new Set(validData.map(item => item.date))];
        const averageDaily = uniqueDates.length > 0 ? totalPredicted / uniqueDates.length : 0;
        
        // Find highest demand blood type across all days
        const bloodTypeVolumes = {};
        validData.forEach(item => {
          if (item.blood_type) {
            bloodTypeVolumes[item.blood_type] = (bloodTypeVolumes[item.blood_type] || 0) + item.predicted_volume;
          }
        });
        
        const highestDemand = Object.entries(bloodTypeVolumes).reduce(
          (max, [type, val]) => val > max.value ? { type, value: val } : max,
          { type: 'N/A', value: 0 }
        );

        return {
          totalPredicted: Math.round(totalPredicted),
          averageDaily: Math.round(averageDaily),
          highestDemand: highestDemand.type,
          period: '7 Days'
        };
      }
    } catch (error) {
      console.error('Error calculating summary:', error);
      return { totalPredicted: 0, averageDaily: 0, highestDemand: 'N/A', period: selectedPeriod === '1d' ? '1 Day' : '7 Days' };
    }
  };

  const summary = calculateSummary();
  console.log('Calculated summary:', summary);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 px-4 sm:px-0">
      <Card className="border shadow-md bg-blue-500">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs sm:text-sm font-medium truncate">Total Predicted</p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {summary.totalPredicted.toLocaleString()}ml
              </p>
            </div>
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-md bg-green-500">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs sm:text-sm font-medium truncate">Daily Average</p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {summary.averageDaily.toLocaleString()}ml
              </p>
            </div>
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-md bg-orange-500">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs sm:text-sm font-medium truncate">Highest Demand</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{summary.highestDemand}</p>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-md bg-purple-500">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs sm:text-sm font-medium truncate">Forecast Period</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{summary.period}</p>
            </div>
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastSummaryCards;
