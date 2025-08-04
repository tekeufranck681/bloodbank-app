import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Package } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';

const ChartsSection = ({ 
  bloodTypeData, 
  stockStatusData, 
  monthlyData, 
  isMobile, 
  itemVariants 
}) => {
  return (
    <>
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 px-4 sm:px-0">
        {/* Blood Type Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Blood Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                <BarChart data={bloodTypeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bloodType" fontSize={isMobile ? 10 : 12} />
                  <YAxis fontSize={isMobile ? 10 : 12} />
                  <Tooltip 
                    active={true}
                    position={{ x: isMobile ? 10 : undefined, y: isMobile ? 10 : undefined }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: isMobile ? '11px' : '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="donors" 
                    fill="hsl(var(--primary))" 
                    name="Donors"
                    stroke={isMobile ? "hsl(var(--primary))" : undefined}
                    strokeWidth={isMobile ? 1 : 0}
                  />
                  <Bar 
                    dataKey="stock" 
                    fill="#6366f1" 
                    name="Stock"
                    stroke={isMobile ? "#6366f1" : undefined}
                    strokeWidth={isMobile ? 1 : 0}
                  />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Mobile data highlights */}
              {isMobile && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>Blood Type</span>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-primary rounded"></div>
                        <span>Donors</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded" style={{backgroundColor: '#6366f1'}}></div>
                        <span>Stock</span>
                      </div>
                    </div>
                  </div>
                  {bloodTypeData.map((item) => (
                    <div key={item.bloodType} className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{item.bloodType}</span>
                        <div className="flex gap-3 text-xs">
                          <span className="text-primary font-medium">{item.donors} donors</span>
                          <span className="font-medium" style={{color: '#6366f1'}}>{item.stock} units</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${Math.max((item.donors / Math.max(...bloodTypeData.map(d => d.donors))) * 100, 5)}%` }}
                          />
                        </div>
                        <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full transition-all duration-300"
                            style={{ 
                              width: `${Math.max((item.stock / Math.max(...bloodTypeData.map(d => d.stock))) * 100, 5)}%`,
                              backgroundColor: '#6366f1'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Status Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Stock Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 30 : 40}
                    outerRadius={isMobile ? 80 : 100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke={isMobile ? "#fff" : undefined}
                    strokeWidth={isMobile ? 2 : 0}
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    active={true}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: isMobile ? '11px' : '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Mobile status highlights */}
              {isMobile && (
                <div className="mt-4 space-y-2">
                  {stockStatusData.map((item) => (
                    <div key={item.name} className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-sm">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg">{item.value}</span>
                          <div className="text-xs text-muted-foreground">
                            {((item.value / stockStatusData.reduce((sum, s) => sum + s.value, 0)) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 bg-background rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: `${Math.max((item.value / Math.max(...stockStatusData.map(s => s.value))) * 100, 5)}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Donations Trend */}
      {monthlyData.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Monthly Donations Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={isMobile ? 10 : 12} />
                  <YAxis fontSize={isMobile ? 10 : 12} />
                  <Tooltip 
                    active={true}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: isMobile ? '11px' : '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="donations" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: isMobile ? 3 : 4 }}
                    name="Donations"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: isMobile ? 3 : 4 }}
                    name="Volume (ml)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
};

export default ChartsSection;