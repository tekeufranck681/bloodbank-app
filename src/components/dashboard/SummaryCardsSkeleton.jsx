import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const SummaryCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 px-4 sm:px-0">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-16 ml-auto rounded-full" />
            </div>
            
            <div className="space-y-4">
              {/* Main metric */}
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>

              {/* Secondary info */}
              <div className="p-3 rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>

              {/* Progress or breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-3/4 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCardsSkeleton;