import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, DollarSign, AlertTriangle } from 'lucide-react';

const OptimizationCharts = ({ optimizationData, selectedPeriod, isMobile }) => {
  if (!optimizationData || !optimizationData.data) {
    return (
      <div className="text-center text-muted-foreground">
        No optimization data available
      </div>
    );
  }

  const data = optimizationData.data;
  
  // Prepare data for charts
  const chartData = Object.entries(data)
    .filter(([key, value]) => typeof value === 'object' && value.recommended_order_bags !== undefined)
    .map(([bloodType, values]) => ({
      bloodType,
      recommendedBags: values.recommended_order_bags || 0,
      emergencyBags: values.emergency_needed_bags || 0,
      totalCost: values.total_cost_xaf || 0,
      recommendedMl: values.recommended_order_ml || 0,
      emergencyMl: values.emergency_needed_ml || 0
    }));

  // Cost distribution data for pie chart
  const costData = chartData.map(item => ({
    name: item.bloodType,
    value: item.totalCost,
    color: getBloodTypeColor(item.bloodType)
  }));

  // Emergency vs Recommended comparison
  const comparisonData = chartData.map(item => ({
    bloodType: item.bloodType,
    recommended: item.recommendedBags,
    emergency: item.emergencyBags
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recommended vs Emergency Orders */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Recommended vs Emergency Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
            <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="bloodType" 
                fontSize={isMobile ? 10 : 12}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 60 : 30}
              />
              <YAxis fontSize={isMobile ? 10 : 12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: isMobile ? '11px' : '12px'
                }}
              />
              <Bar dataKey="recommended" fill="hsl(var(--primary))" name="Recommended" />
              <Bar dataKey="emergency" fill="#ef4444" name="Emergency" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Distribution */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Cost Distribution by Blood Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
            <PieChart>
              <Pie
                data={costData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 40 : 60}
                outerRadius={isMobile ? 80 : 120}
                paddingAngle={5}
                dataKey="value"
              >
                {costData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XAF',
                    minimumFractionDigits: 0
                  }).format(value),
                  'Cost'
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: isMobile ? '11px' : '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {costData.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Volume Requirements */}
      <Card className="border-0 shadow-card lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Volume Requirements (ml)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="bloodType" 
                fontSize={isMobile ? 10 : 12}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 60 : 30}
              />
              <YAxis fontSize={isMobile ? 10 : 12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: isMobile ? '11px' : '12px'
                }}
              />
              <Bar dataKey="recommendedMl" fill="#10b981" name="Recommended (ml)" />
              <Bar dataKey="emergencyMl" fill="#f59e0b" name="Emergency (ml)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get consistent colors for blood types
const getBloodTypeColor = (bloodType) => {
  const colors = {
    'A+': '#ef4444',
    'A-': '#f97316', 
    'B+': '#eab308',
    'B-': '#84cc16',
    'AB+': '#10b981',
    'AB-': '#06b6d4',
    'O+': '#3b82f6',
    'O-': '#8b5cf6'
  };
  return colors[bloodType] || '#6b7280';
};

export default OptimizationCharts;
