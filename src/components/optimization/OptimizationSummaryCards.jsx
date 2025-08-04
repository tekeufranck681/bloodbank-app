import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, DollarSign, Package } from 'lucide-react';

const OptimizationSummaryCards = ({ optimizationData, selectedPeriod }) => {
  const calculateSummary = () => {
    if (!optimizationData || !optimizationData.data) {
      return {
        totalCost: 0,
        totalRecommendedBags: 0,
        totalEmergencyBags: 0,
        optimizationStatus: 'Unknown'
      };
    }

    const data = optimizationData.data;
    let totalCost = 0;
    let totalRecommendedBags = 0;
    let totalEmergencyBags = 0;

    // Handle weekly data with total_week_cost_xaf
    if (selectedPeriod === '7d' && data.total_week_cost_xaf) {
      totalCost = data.total_week_cost_xaf;
    }

    Object.entries(data).forEach(([bloodType, values]) => {
      if (typeof values === 'object' && values.recommended_order_bags !== undefined) {
        totalRecommendedBags += values.recommended_order_bags || 0;
        totalEmergencyBags += values.emergency_needed_bags || 0;
        
        // For daily data, sum up individual costs
        if (selectedPeriod === '1d') {
          totalCost += values.total_cost_xaf || 0;
        }
      }
    });

    return {
      totalCost,
      totalRecommendedBags,
      totalEmergencyBags,
      optimizationStatus: data.status || 'Unknown'
    };
  };

  const summary = calculateSummary();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Cost */}
      <Card className="border-0 shadow-card bg-gradient-to-br from-green-500 to-green-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Cost</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(summary.totalCost)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-white/80" />
          </div>
        </CardContent>
      </Card>

      {/* Recommended Orders */}
      <Card className="border-0 shadow-card bg-gradient-to-br from-blue-500 to-blue-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Recommended Orders</p>
              <p className="text-xl font-bold text-white">
                {summary.totalRecommendedBags} bags
              </p>
            </div>
            <Package className="h-8 w-8 text-white/80" />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Needed */}
      <Card className="border-0 shadow-card bg-gradient-to-br from-orange-500 to-orange-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Emergency Needed</p>
              <p className="text-xl font-bold text-white">
                {summary.totalEmergencyBags} bags
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-white/80" />
          </div>
        </CardContent>
      </Card>

      {/* Optimization Status */}
      <Card className="border-0 shadow-card bg-gradient-to-br from-purple-500 to-purple-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Status</p>
              <p className="text-xl font-bold text-white">
                {summary.optimizationStatus}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-white/80" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizationSummaryCards;