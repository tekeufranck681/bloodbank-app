import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, TrendingUp } from 'lucide-react';

const ForecastDetails = ({ forecastData, selectedPeriod }) => {
  if (!forecastData) return null;

  const renderDailyForecast = () => {
    // Daily data: { "A+": 1302.98, "A-": 1460.20, ... }
    if (typeof forecastData !== 'object' || Array.isArray(forecastData)) {
      return <div className="text-center text-muted-foreground">Invalid data format for daily forecast</div>;
    }
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(forecastData).map(([bloodType, volume]) => (
          <div key={bloodType} className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-xs">{bloodType}</Badge>
              <span className="text-xs text-muted-foreground">ml</span>
            </div>
            <p className="text-lg font-bold">{Math.round(volume).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Next day demand</p>
          </div>
        ))}
      </div>
    );
  };

  const renderWeeklyForecast = () => {
    // Weekly data: [{ date, blood_type, predicted_volume }, ...]
    if (!Array.isArray(forecastData)) {
      return <div className="text-center text-muted-foreground">Invalid data format for weekly forecast</div>;
    }
    
    const uniqueDates = [...new Set(forecastData.map(item => item.date))].sort();
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // Calculate daily totals and trends
    const dailyTotals = uniqueDates.map(date => {
      const dayData = forecastData.filter(item => item.date === date);
      const total = dayData.reduce((sum, item) => sum + item.predicted_volume, 0);
      return { date, total, data: dayData };
    });

    // Find highest demand days for each blood type
    const highestDemandDays = {};
    bloodTypes.forEach(type => {
      const typeData = forecastData.filter(item => item.blood_type === type);
      const highest = typeData.reduce((max, item) => 
        item.predicted_volume > max.predicted_volume ? item : max
      );
      highestDemandDays[type] = highest;
    });

    // Check if demand is growing
    const isGrowing = dailyTotals.length > 1 && 
      dailyTotals[dailyTotals.length - 1].total > dailyTotals[0].total;

    return (
      <div className="space-y-4">
        {/* Trend Analysis */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Weekly Trend Analysis
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Overall Trend</p>
              <p className={`font-medium ${isGrowing ? 'text-orange-600' : 'text-green-600'}`}>
                {isGrowing ? 'Growing Demand' : 'Stable Demand'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Peak Day</p>
              <p className="font-medium">
                {dailyTotals.reduce((max, day) => day.total > max.total ? day : max).date}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Weekly Total</p>
              <p className="font-medium">
                {Math.round(dailyTotals.reduce((sum, day) => sum + day.total, 0)).toLocaleString()}ml
              </p>
            </div>
          </div>
        </div>

        {/* Highest Demand Alerts */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-4 w-4" />
            Peak Demand Days by Blood Type
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(highestDemandDays).map(([type, data]) => (
              <div key={type} className="text-center bg-white rounded p-2">
                <Badge variant="outline" className="text-xs mb-1">{type}</Badge>
                <p className="text-xs font-medium">{new Date(data.date).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground">{Math.round(data.predicted_volume)}ml</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-3">
          {dailyTotals.map((day, index) => (
            <div key={day.date} className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">
                  Day {index + 1} - {new Date(day.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </h4>
                <span className="text-xs text-muted-foreground">
                  Total: {Math.round(day.total).toLocaleString()}ml
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {day.data.map((item) => (
                  <div key={`${item.date}-${item.blood_type}`} className="text-center">
                    <Badge variant="outline" className="text-xs mb-1">{item.blood_type}</Badge>
                    <p className="text-sm font-medium">{Math.round(item.predicted_volume)}ml</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Detailed Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedPeriod === '1d' ? renderDailyForecast() : renderWeeklyForecast()}
      </CardContent>
    </Card>
  );
};

export default ForecastDetails;
