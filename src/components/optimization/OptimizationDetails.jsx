import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, DollarSign, Droplets } from 'lucide-react';

const OptimizationDetails = ({ optimizationData, selectedPeriod }) => {
  if (!optimizationData || !optimizationData.data) {
    return (
      <Card className="border-0 shadow-card">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No optimization details available
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = optimizationData.data;
  
  // Filter out non-blood type entries
  const bloodTypeData = Object.entries(data)
    .filter(([key, value]) => typeof value === 'object' && value.recommended_order_bags !== undefined)
    .map(([bloodType, values]) => ({
      bloodType,
      ...values
    }));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getUrgencyLevel = (emergencyBags, recommendedBags) => {
    if (emergencyBags === 0) return { level: 'Low', color: 'bg-green-100 text-green-800' };
    if (emergencyBags <= recommendedBags * 0.5) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'High', color: 'bg-red-100 text-red-800' };
  };

  return (
    <Card className="border-0 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Detailed Optimization Breakdown
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10">
            {selectedPeriod === '1d' ? 'Daily' : 'Weekly'} Optimization
          </Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Status: {data.status || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bloodTypeData.map((item) => {
            const urgency = getUrgencyLevel(item.emergency_needed_bags, item.recommended_order_bags);
            
            return (
              <div key={item.bloodType} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-red-500" />
                      <span className="font-semibold text-lg">{item.bloodType}</span>
                    </div>
                    <Badge className={urgency.color}>
                      {urgency.level} Priority
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center text-muted-foreground">
                        <Package className="h-3 w-3" />
                        <span>Recommended</span>
                      </div>
                      <div className="font-semibold">{item.recommended_order_bags} bags</div>
                      <div className="text-xs text-muted-foreground">{item.recommended_order_ml}ml</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center text-muted-foreground">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Emergency</span>
                      </div>
                      <div className="font-semibold text-orange-600">{item.emergency_needed_bags} bags</div>
                      <div className="text-xs text-muted-foreground">{item.emergency_needed_ml}ml</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>Total Cost</span>
                      </div>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(item.total_cost_xaf)}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-muted-foreground">Total Volume</div>
                      <div className="font-semibold">
                        {(item.recommended_order_ml + item.emergency_needed_ml).toLocaleString()}ml
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.recommended_order_bags + item.emergency_needed_bags} bags
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar showing emergency vs recommended ratio */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Order Distribution</span>
                    <span>{Math.round((item.emergency_needed_bags / (item.recommended_order_bags + item.emergency_needed_bags)) * 100)}% Emergency</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-l-full" 
                      style={{ 
                        width: `${(item.recommended_order_bags / (item.recommended_order_bags + item.emergency_needed_bags)) * 100}%` 
                      }}
                    ></div>
                    <div 
                      className="bg-orange-500 h-2 rounded-r-full -mt-2 ml-auto" 
                      style={{ 
                        width: `${(item.emergency_needed_bags / (item.recommended_order_bags + item.emergency_needed_bags)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Weekly total cost summary */}
        {selectedPeriod === '7d' && data.total_week_cost_xaf && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="font-semibold">Total Weekly Cost</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(data.total_week_cost_xaf)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OptimizationDetails;