import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, ChevronDown, ChevronUp, Calculator, DollarSign, Package, AlertTriangle, Droplets } from 'lucide-react';

const OptimizationCalculationInfo = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const calculationParams = {
    mlPerBag: 450,
    safetyStockMl: {
      "O+": 500, "O-": 300,
      "A+": 450, "A-": 250,
      "B+": 350, "B-": 150,
      "AB+": 200, "AB-": 100
    },
    routineCostPerBag: 12000, // XAF
    emergencyCostPerBag: 25000, // XAF
    wastageRate: 0.12, // 12%
    maxOrderMl: {
      "O+": 2000, "O-": 1000,
      "A+": 1800, "A-": 900,
      "B+": 1500, "B-": 700,
      "AB+": 700, "AB-": 400
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="border-0 shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Optimization Calculation Parameters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Info className="h-4 w-4" />
            {isExpanded ? 'Hide Details' : 'Show Details'}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Understanding how the AI optimization system calculates blood inventory recommendations
        </p>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Basic Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">Volume per Bag</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{calculationParams.mlPerBag}ml</p>
              <p className="text-xs text-blue-600">Standard blood bag volume</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-semibold text-orange-800">Wastage Rate</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{(calculationParams.wastageRate * 100)}%</p>
              <p className="text-xs text-orange-600">Expected handling/environment loss</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-800">Cost Difference</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(calculationParams.emergencyCostPerBag - calculationParams.routineCostPerBag)}
              </p>
              <p className="text-xs text-green-600">Emergency vs Routine cost</p>
            </div>
          </div>

          {/* Cost Structure */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Cost Structure (per bag)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-800">Routine Order</span>
                  <Badge className="bg-green-100 text-green-800">Planned</Badge>
                </div>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {formatCurrency(calculationParams.routineCostPerBag)}
                </p>
                <p className="text-xs text-green-600">≈ $20 USD per bag</p>
              </div>
              
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-red-800">Emergency Order</span>
                  <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                </div>
                <p className="text-xl font-bold text-red-600 mt-1">
                  {formatCurrency(calculationParams.emergencyCostPerBag)}
                </p>
                <p className="text-xs text-red-600">≈ $40 USD per bag</p>
              </div>
            </div>
          </div>

          {/* Safety Stock by Blood Type */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-primary" />
              Safety Stock Requirements (ml)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(calculationParams.safetyStockMl).map(([bloodType, volume]) => (
                <div key={bloodType} className="p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-red-600">{bloodType}</span>
                    <Badge variant="outline" className="text-xs">{volume}ml</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Maximum Order Limits */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Maximum Order Limits (ml)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(calculationParams.maxOrderMl).map(([bloodType, maxVolume]) => (
                <div key={bloodType} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-800">{bloodType}</span>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">{maxVolume}ml</Badge>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    ≈ {Math.round(maxVolume / calculationParams.mlPerBag)} bags max
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-semibold mb-2 text-primary">How the Optimization Works:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Predicts demand</strong> based on historical usage patterns</li>
              <li>• <strong>Maintains safety stock</strong> to prevent stockouts</li>
              <li>• <strong>Minimizes total cost</strong> by balancing routine vs emergency orders</li>
              <li>• <strong>Accounts for wastage</strong> in all calculations</li>
              <li>• <strong>Respects maximum limits</strong> to prevent over-ordering</li>
              <li>• <strong>Prioritizes critical blood types</strong> (O-, AB+) with higher safety margins</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default OptimizationCalculationInfo;