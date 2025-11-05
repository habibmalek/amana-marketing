// app/weekly-view/page.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, WeeklyPerformance } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { LineChart } from '../../src/components/ui/line-chart';
import { Calendar, TrendingUp, DollarSign, MousePointer, Target, Users } from 'lucide-react';

export default function WeeklyView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading marketing data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Process weekly performance data
  const weeklyMetrics = useMemo(() => {
    if (!marketingData?.campaigns) {
      return {
        totalRevenue: 0,
        totalSpend: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        revenueByWeek: [],
        spendByWeek: [],
        impressionsByWeek: [],
        clicksByWeek: []
      };
    }

    // Aggregate all weekly performance data across campaigns
    const weeklyMap: { [key: string]: WeeklyPerformance } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.weekly_performance.forEach(week => {
        const weekKey = `${week.week_start}_${week.week_end}`;
        
        if (!weeklyMap[weekKey]) {
          weeklyMap[weekKey] = { ...week };
        } else {
          weeklyMap[weekKey].impressions += week.impressions;
          weeklyMap[weekKey].clicks += week.clicks;
          weeklyMap[weekKey].conversions += week.conversions;
          weeklyMap[weekKey].spend += week.spend;
          weeklyMap[weekKey].revenue += week.revenue;
        }
      });
    });

    // Convert to arrays and sort by week start date
    const weeklyData = Object.values(weeklyMap).sort((a, b) => 
      new Date(a.week_start).getTime() - new Date(b.week_start).getTime()
    );

    // Calculate totals
    const totals = weeklyData.reduce((acc, week) => ({
      totalRevenue: acc.totalRevenue + week.revenue,
      totalSpend: acc.totalSpend + week.spend,
      totalImpressions: acc.totalImpressions + week.impressions,
      totalClicks: acc.totalClicks + week.clicks,
      totalConversions: acc.totalConversions + week.conversions
    }), {
      totalRevenue: 0,
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0
    });

    // Format data for charts
    const revenueByWeek = weeklyData.map(week => ({
      label: `Week ${new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      value: week.revenue,
      color: '#10B981'
    }));

    const spendByWeek = weeklyData.map(week => ({
      label: `Week ${new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      value: week.spend,
      color: '#3B82F6'
    }));

    const impressionsByWeek = weeklyData.map(week => ({
      label: `Week ${new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      value: week.impressions,
      color: '#F59E0B'
    }));

    const clicksByWeek = weeklyData.map(week => ({
      label: `Week ${new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      value: week.clicks,
      color: '#EF4444'
    }));

    return {
      ...totals,
      revenueByWeek,
      spendByWeek,
      impressionsByWeek,
      clicksByWeek,
      weeklyData
    };
  }, [marketingData?.campaigns]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading weekly data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8 sm:py-12">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {error ? (
                <div className="bg-red-900 border border-red-700 text-red-200 px-3 sm:px-4 py-3 rounded mb-4 max-w-2xl mx-auto text-sm sm:text-base">
                  Error loading data: {error}
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                  Weekly Performance
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && (
            <>
              {/* Weekly Summary Cards */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Weekly Performance Summary</h2>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
                  <CardMetric
                    title="Total Revenue"
                    value={`$${weeklyMetrics.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                    className="text-green-400"
                  />
                  
                  <CardMetric
                    title="Total Spend"
                    value={`$${weeklyMetrics.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    className="text-blue-400"
                  />
                  
                  <CardMetric
                    title="Total Impressions"
                    value={weeklyMetrics.totalImpressions.toLocaleString()}
                    icon={<Target className="h-5 w-5" />}
                  />
                  
                  <CardMetric
                    title="Total Clicks"
                    value={weeklyMetrics.totalClicks.toLocaleString()}
                    icon={<MousePointer className="h-5 w-5" />}
                  />
                  
                  <CardMetric
                    title="Total Conversions"
                    value={weeklyMetrics.totalConversions.toLocaleString()}
                    icon={<Users className="h-5 w-5" />}
                    className="text-purple-400"
                  />
                </div>
              </div>

              {/* Revenue and Spend Line Charts */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Revenue & Spend Trends</h2>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <LineChart
                    title="Revenue by Week"
                    data={weeklyMetrics.revenueByWeek}
                    formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    lineColor="#10B981"
                    areaOpacity={0.2}
                    height={300}
                  />
                  
                  <LineChart
                    title="Spend by Week"
                    data={weeklyMetrics.spendByWeek}
                    formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    lineColor="#3B82F6"
                    areaOpacity={0.2}
                    height={300}
                  />
                </div>
              </div>

              {/* Additional Performance Charts */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <Target className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Engagement Metrics</h2>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <LineChart
                    title="Impressions by Week"
                    data={weeklyMetrics.impressionsByWeek}
                    formatValue={(value) => value.toLocaleString()}
                    lineColor="#F59E0B"
                    areaOpacity={0.2}
                    height={280}
                  />
                  
                  <LineChart
                    title="Clicks by Week"
                    data={weeklyMetrics.clicksByWeek}
                    formatValue={(value) => value.toLocaleString()}
                    lineColor="#EF4444"
                    areaOpacity={0.2}
                    height={280}
                  />
                </div>
              </div>

              {/* Performance Summary */}
              {weeklyMetrics.weeklyData.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Weekly Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {weeklyMetrics.weeklyData.slice(-3).map((week, index) => (
                      <div key={index} className="bg-gray-750 rounded-lg p-4 border border-gray-600">
                        <div className="text-sm font-medium text-gray-400 mb-2">
                          {new Date(week.week_start).toLocaleDateString()} - {new Date(week.week_end).toLocaleDateString()}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Revenue:</span>
                            <span className="text-green-400 font-medium">
                              ${week.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Spend:</span>
                            <span className="text-blue-400 font-medium">
                              ${week.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">ROI:</span>
                            <span className="font-medium">
                              {week.spend > 0 ? ((week.revenue / week.spend) * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
