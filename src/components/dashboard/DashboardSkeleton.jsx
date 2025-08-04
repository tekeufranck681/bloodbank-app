import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 mb-6 px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <Card className="border-0 shadow-card mx-4 sm:mx-0">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 px-4 sm:px-0">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border shadow-md">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forecast, Optimization & Analytics Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 px-4 sm:px-0">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-16 ml-auto rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <div className="p-3 rounded-lg border">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 px-4 sm:px-0">
        {[1, 2].map((i) => (
          <Card key={i} className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-40" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Trend Skeleton */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full rounded" />
        </CardContent>
      </Card>

      {/* Recent Activity and Alerts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 px-4 sm:px-0">
        {[1, 2].map((i) => (
          <Card key={i} className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <Skeleton className="h-6 w-12 rounded-full" />
                      <div className="min-w-0 flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <Skeleton className="h-4 w-12 mb-1" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;