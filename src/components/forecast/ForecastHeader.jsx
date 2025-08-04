import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

const ForecastHeader = ({ selectedPeriod, onPeriodChange, onRefresh, onRerunPrediction, isLoading }) => {
  return (
    <div className="flex flex-col gap-4 mb-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            Blood Demand Forecast
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            AI-powered predictions for blood demand
            {selectedPeriod === '1d' && ' - Next Day Forecast'}
            {selectedPeriod === '7d' && ' - Next 7 Days Forecast'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Next Day</SelectItem>
              <SelectItem value="7d">Next 7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="default"
            onClick={onRerunPrediction}
            disabled={isLoading}
            className="flex-shrink-0 bg-gradient-medical hover:shadow-medical"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isLoading ? 'Running...' : 'Re-run Prediction'}
            </span>
            <span className="sm:hidden">
              {isLoading ? 'Running...' : 'Re-run'}
            </span>
          </Button>
          <Button 
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForecastHeader;
