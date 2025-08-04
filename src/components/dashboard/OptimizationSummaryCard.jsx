import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, AlertTriangle, ShoppingCart } from 'lucide-react';

const OptimizationSummaryCard = ({ optimizationData, selectedPeriod = '1d' }) => {
  const calculateOptimizationSummary = () => {
    if (!optimizationData || !optimizationData.data) {
      return {
        totalRecommendedBags: 0,
        totalCost: 0,
        emergencyBags: 0,
        status: 'Unknown',
        criticalBloodTypes: []
      };
    }

    const data = optimizationData.data;
    let totalCost = 0;
    let totalRecommendedBags = 0;
    let emergencyBags = 0;
    const criticalBloodTypes = [];

    // Handle weekly data with total_week_cost_xaf
    if (selectedPeriod === '7d' && data.total_week_cost_xaf) {
      totalCost = data.total_week_cost_xaf;
    }

    Object.entries(data).forEach(([bloodType, values]) => {
      if (typeof values === 'object' && values.recommended_order_bags !== undefined) {
        totalRecommendedBags += values.recommended_order_bags || 0;
        emergencyBags += values.emergency_needed_bags || 0;
        
        // For daily data, sum up individual costs
        if (selectedPeriod === '1d') {
          totalCost += values.total_cost_xaf || 0;
        }

        // Identify critical blood types (those needing emergency orders)
        if (values.emergency_needed_bags > 0) {
          criticalBloodTypes.push({
            type: bloodType,
            emergencyBags: values.emergency_needed_bags,
            recommendedBags: values.recommended_order_bags
          });
        }
      }
    });

    return {
      totalRecommendedBags,
      totalCost,
      emergencyBags,
      status: data.status || 'Unknown',
      criticalBloodTypes: criticalBloodTypes.sort((a, b) => b.emergencyBags - a.emergencyBags)
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const { totalRecommendedBags, totalCost, emergencyBags, status, criticalBloodTypes } = calculateOptimizationSummary();

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          Optimization Summary
          <Badge variant="outline" className="ml-auto">
            {selectedPeriod === '1d' ? 'Daily' : 'Weekly'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Recommended Bags */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Recommended Order</p>
            <p className="text-2xl font-bold text-green-600">
              {totalRecommendedBags} bags
            </p>
          </div>
          <ShoppingCart className="h-8 w-8 text-green-600" />
        </div>

        {/* Total Cost */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-lg font-semibold text-green-800">
              {formatCurrency(totalCost)}
            </p>
          </div>
          <DollarSign className="h-6 w-6 text-green-600" />
        </div>

        {/* Emergency Orders Alert */}
        {emergencyBags > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-red-800">Emergency Orders Needed</span>
            </div>
            <p className="text-2xl font-bold text-red-600 mb-2">{emergencyBags} bags</p>
            <div className="space-y-1">
              {criticalBloodTypes.slice(0, 3).map((item) => (
                <div key={item.type} className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className="text-red-600 border-red-300">
                    {item.type}
                  </Badge>
                  <span className="text-red-600 font-medium">
                    {item.emergencyBags} bags needed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Optimization Status</span>
          <Badge 
            className={
              status === 'optimal' ? 'bg-green-100 text-green-800' :
              status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }
          >
            {status}
          </Badge>
        </div>

        {totalRecommendedBags === 0 && totalCost === 0 && (
          <div className="text-center py-4">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No optimization data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OptimizationSummaryCard;