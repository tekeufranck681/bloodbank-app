import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const CombinedAnalyticsCard = ({ forecastData, optimizationData, stockData, selectedPeriod = '1d' }) => {
  const calculateCombinedMetrics = () => {
    // Calculate forecast total
    let forecastTotal = 0;
    if (forecastData) {
      if (selectedPeriod === '1d' && typeof forecastData === 'object' && !Array.isArray(forecastData)) {
        forecastTotal = Object.values(forecastData)
          .filter(val => typeof val === 'number' && !isNaN(val))
          .reduce((sum, val) => sum + val, 0);
      } else if (selectedPeriod === '7d' && Array.isArray(forecastData)) {
        forecastTotal = forecastData
          .filter(item => item && typeof item.predicted_volume === 'number')
          .reduce((sum, item) => sum + item.predicted_volume, 0);
      }
    }

    // Calculate optimization metrics
    let optimizationCost = 0;
    let recommendedBags = 0;
    let emergencyBags = 0;
    
    if (optimizationData && optimizationData.data) {
      const data = optimizationData.data;
      
      if (selectedPeriod === '7d' && data.total_week_cost_xaf) {
        optimizationCost = data.total_week_cost_xaf;
      }

      Object.entries(data).forEach(([_, values]) => {
        if (typeof values === 'object' && values.recommended_order_bags !== undefined) {
          recommendedBags += values.recommended_order_bags || 0;
          emergencyBags += values.emergency_needed_bags || 0;
          
          if (selectedPeriod === '1d') {
            optimizationCost += values.total_cost_xaf || 0;
          }
        }
      });
    }

    // Calculate current stock
    const availableStock = stockData ? stockData.filter(s => s.status === 'available').length : 0;
    const totalStockVolume = stockData ? stockData
      .filter(s => s.status === 'available')
      .reduce((sum, s) => sum + (s.volume_ml || 450), 0) : 0; // Default 450ml per bag

    // Calculate metrics
    const costEfficiencyRatio = forecastTotal > 0 ? (optimizationCost / forecastTotal) : 0;
    const stockAdequacyScore = forecastTotal > 0 ? Math.min((totalStockVolume / forecastTotal) * 100, 100) : 0;
    const riskLevel = emergencyBags > 0 ? 'High' : stockAdequacyScore < 50 ? 'Medium' : 'Low';

    return {
      forecastTotal,
      optimizationCost,
      recommendedBags,
      emergencyBags,
      availableStock,
      totalStockVolume,
      costEfficiencyRatio,
      stockAdequacyScore,
      riskLevel
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const metrics = calculateCombinedMetrics();

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAdequacyColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          Combined Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cost Efficiency */}
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-800">Cost per ML Predicted</span>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-purple-600">
            {metrics.forecastTotal > 0 ? 
              `${(metrics.costEfficiencyRatio).toFixed(2)} XAF/ml` : 
              'N/A'
            }
          </p>
          <p className="text-xs text-purple-600">
            {metrics.forecastTotal > 0 ? 
              `${formatCurrency(metrics.optimizationCost)} for ${Math.round(metrics.forecastTotal)}ml` :
              'No data available'
            }
          </p>
        </div>

        {/* Stock Adequacy Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Stock Adequacy Score</span>
            <span className="text-sm font-bold">{metrics.stockAdequacyScore.toFixed(1)}%</span>
          </div>
          <Progress 
            value={metrics.stockAdequacyScore} 
            className="h-3"
            style={{ '--progress-background': getAdequacyColor(metrics.stockAdequacyScore) }}
          />
          <p className="text-xs text-muted-foreground">
            Current stock vs predicted demand coverage
          </p>
        </div>

        {/* Risk Assessment */}
        <div className="flex items-center justify-between p-3 rounded-lg border" 
             style={{ backgroundColor: getRiskColor(metrics.riskLevel).includes('red') ? '#fef2f2' : 
                                      getRiskColor(metrics.riskLevel).includes('yellow') ? '#fffbeb' : '#f0fdf4' }}>
          <div className="flex items-center gap-2">
            {metrics.riskLevel === 'High' ? 
              <AlertCircle className="h-4 w-4 text-red-600" /> :
              <CheckCircle className="h-4 w-4 text-green-600" />
            }
            <span className="font-medium">Risk Level</span>
          </div>
          <Badge className={getRiskColor(metrics.riskLevel)}>
            {metrics.riskLevel}
          </Badge>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center p-2 bg-muted/50 rounded">
            <p className="text-muted-foreground">Available Stock</p>
            <p className="font-bold">{metrics.availableStock} bags</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <p className="text-muted-foreground">Recommended Order</p>
            <p className="font-bold">{metrics.recommendedBags} bags</p>
          </div>
        </div>

        {/* Emergency Alert */}
        {metrics.emergencyBags > 0 && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                {metrics.emergencyBags} emergency bags needed
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CombinedAnalyticsCard;