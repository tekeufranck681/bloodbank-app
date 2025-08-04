import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const ForecastCharts = ({ forecastData, selectedPeriod, isMobile }) => {
  if (!forecastData) return null;

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4'];

  const prepareChartData = () => {
    if (selectedPeriod === '1d') {
      // Daily data: { "A+": 1302.98, "A-": 1460.20, ... }
      if (typeof forecastData !== 'object' || Array.isArray(forecastData)) {
        console.error('Expected object for 1d data, got:', typeof forecastData);
        return { bloodTypeDistribution: [], dailyData: null };
      }
      
      return {
        bloodTypeDistribution: bloodTypes.map((type, index) => ({
          bloodType: type,
          predicted: Math.round(forecastData[type] || 0),
          color: colors[index]
        })),
        dailyData: null
      };
    } else {
      // Weekly data: [{ date, blood_type, predicted_volume }, ...]
      if (!Array.isArray(forecastData)) {
        console.error('Expected array for 7d data, got:', typeof forecastData);
        return { bloodTypeDistribution: [], dailyData: null };
      }
      
      const bloodTypeDistribution = bloodTypes.map((type, index) => {
        const totalForType = forecastData
          .filter(item => item.blood_type === type)
          .reduce((sum, item) => sum + item.predicted_volume, 0);
        return {
          bloodType: type,
          predicted: Math.round(totalForType / 7), // Average per day
          color: colors[index]
        };
      });

      // Prepare daily trend data
      const uniqueDates = [...new Set(forecastData.map(item => item.date))].sort();
      const dailyData = uniqueDates.map(date => {
        const dayData = { date };
        bloodTypes.forEach(type => {
          const item = forecastData.find(f => f.date === date && f.blood_type === type);
          dayData[type] = Math.round(item?.predicted_volume || 0);
        });
        return dayData;
      });

      return { bloodTypeDistribution, dailyData };
    }
  };

  const { bloodTypeDistribution, dailyData } = prepareChartData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 px-4 sm:px-0">
      {/* Blood Type Demand Distribution */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Blood Type Demand Distribution
            {selectedPeriod === '7d' && ' (Daily Average)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
            <BarChart data={bloodTypeDistribution} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bloodType" fontSize={isMobile ? 10 : 12} />
              <YAxis fontSize={isMobile ? 10 : 12} />
              <Tooltip 
                formatter={(value) => [`${value}ml`, 'Predicted Demand']}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="predicted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 7-Day Trend Chart */}
      {selectedPeriod === '7d' && dailyData && (
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              7-Day Demand Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
              <LineChart data={dailyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={isMobile ? 10 : 12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis fontSize={isMobile ? 10 : 12} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="O+" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="A+" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="B+" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="AB+" stroke="#84cc16" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Daily Pie Chart */}
      {selectedPeriod === '1d' && (
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Next Day Demand Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
              <PieChart>
                <Pie
                  data={bloodTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 30 : 40}
                  outerRadius={isMobile ? 80 : 100}
                  paddingAngle={5}
                  dataKey="predicted"
                >
                  {bloodTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}ml`, 'Predicted']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {bloodTypeDistribution.map((item, index) => (
                <div key={item.bloodType} className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium">{item.bloodType}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ForecastCharts;
