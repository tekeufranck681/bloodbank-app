import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const ForecastSummaryCard = ({ forecastData, selectedPeriod = '1d' }) => {
  const calculateForecastSummary = () => {
    if (!forecastData) {
      return { totalPredicted: 0, highestDemand: 'N/A', bloodTypeBreakdown: [] };
    }

    if (selectedPeriod === '1d') {
      // Daily forecast: { "A+": 1302.98, "A-": 1460.20, ... }
      if (typeof forecastData !== 'object' || Array.isArray(forecastData)) {
        return { totalPredicted: 0, highestDemand: 'N/A', bloodTypeBreakdown: [] };
      }

      const values = Object.values(forecastData).filter(val => typeof val === 'number' && !isNaN(val));
      const totalPredicted = values.reduce((sum, val) => sum + val, 0);
      
      const highestDemand = Object.entries(forecastData).reduce(
        (max, [type, val]) => (typeof val === 'number' && val > max.value) ? { type, value: val } : max,
        { type: 'N/A', value: 0 }
      );

      const bloodTypeBreakdown = Object.entries(forecastData)
        .filter(([_, val]) => typeof val === 'number' && !isNaN(val))
        .map(([type, val]) => ({ type, value: val, percentage: (val / totalPredicted) * 100 }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4);

      return { totalPredicted, highestDemand: highestDemand.type, bloodTypeBreakdown };
    } else {
      // Weekly forecast: [{ date, blood_type, predicted_volume }, ...]
      if (!Array.isArray(forecastData)) {
        return { totalPredicted: 0, highestDemand: 'N/A', bloodTypeBreakdown: [] };
      }

      const validData = forecastData.filter(item => 
        item && typeof item.predicted_volume === 'number' && !isNaN(item.predicted_volume)
      );

      const totalPredicted = validData.reduce((sum, item) => sum + item.predicted_volume, 0);
      
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

      const bloodTypeBreakdown = Object.entries(bloodTypeVolumes)
        .map(([type, val]) => ({ type, value: val, percentage: (val / totalPredicted) * 100 }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4);

      return { totalPredicted, highestDemand: highestDemand.type, bloodTypeBreakdown };
    }
  };

  const { totalPredicted, highestDemand, bloodTypeBreakdown } = calculateForecastSummary();

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          Forecast Summary
          <Badge variant="outline" className="ml-auto">
            {selectedPeriod === '1d' ? 'Next Day' : 'Next 7 Days'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Predicted */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Predicted Demand</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(totalPredicted).toLocaleString()}ml
            </p>
          </div>
          <Activity className="h-8 w-8 text-blue-600" />
        </div>

        {/* Highest Demand */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Highest Demand</p>
            <p className="text-lg font-semibold text-blue-800">{highestDemand}</p>
          </div>
          <Badge className="bg-blue-100 text-blue-800">Priority</Badge>
        </div>

        {/* Blood Type Breakdown */}
        {bloodTypeBreakdown.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Top Blood Types</p>
            {bloodTypeBreakdown.map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <Badge variant="outline" className="w-12 justify-center">{item.type}</Badge>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{Math.round(item.value)}ml</span>
                    <span>{item.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPredicted === 0 && (
          <div className="text-center py-4">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No forecast data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ForecastSummaryCard;