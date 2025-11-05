// app/region-view/page.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, RegionalPerformance } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { HeatMap } from '../../src/components/ui/heat-map';
import { Table } from '../../src/components/ui/table';
import { MapPin, DollarSign, TrendingUp, Target, MousePointer, Users, Globe } from 'lucide-react';

// UAE city coordinates mapping
const UAE_CITY_COORDINATES: { [key: string]: [number, number] } = {
  'Dubai': [25.2048, 55.2708],
  'Sharjah': [25.3460, 55.4200],
  'Abu Dhabi': [24.4539, 54.3773],
  'Al Ain': [24.1302, 55.8023],
  'Ras Al Khaimah': [25.6741, 55.9804],
  'Fujairah': [25.1288, 56.3265],
  'Ajman': [25.4052, 55.5136],
  'Umm Al Quwain': [25.5653, 55.5533]
};

export default function RegionView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedValueKey, setSelectedValueKey] = useState<'revenue' | 'spend'>('revenue');

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

  // Process regional performance data
  const regionalMetrics = useMemo(() => {
    if (!marketingData?.campaigns) {
      return {
        totalRevenue: 0,
        totalSpend: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        regionalData: [],
        topRegion: null
      };
    }

    // Aggregate all regional performance data across campaigns
    const regionMap: { [key: string]: RegionalPerformance & { campaignCount: number } } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.regional_performance.forEach(region => {
        const regionKey = `${region.region}_${region.country}`;
        
        if (!regionMap[regionKey]) {
          regionMap[regionKey] = {
            ...region,
            campaignCount: 1
          };
        } else {
          regionMap[regionKey].impressions += region.impressions;
          regionMap[regionKey].clicks += region.clicks;
          regionMap[regionKey].conversions += region.conversions;
          regionMap[regionKey].spend += region.spend;
          regionMap[regionKey].revenue += region.revenue;
          regionMap[regionKey].campaignCount += 1;
          
          // Recalculate derived metrics
          const r = regionMap[regionKey];
          r.ctr = r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0;
          r.conversion_rate = r.clicks > 0 ? (r.conversions / r.clicks) * 100 : 0;
          r.cpc = r.clicks > 0 ? r.spend / r.clicks : 0;
          r.cpa = r.conversions > 0 ? r.spend / r.conversions : 0;
          r.roas = r.spend > 0 ? r.revenue / r.spend : 0;
        }
      });
    });

    // Convert to array and add coordinates
    const regionalData = Object.values(regionMap).map(region => ({
      ...region,
      lat: UAE_CITY_COORDINATES[region.region]?.[0],
      lng: UAE_CITY_COORDINATES[region.region]?.[1],
      value: region[selectedValueKey]
    }));

    // Calculate totals
    const totals = regionalData.reduce((acc, region) => ({
      totalRevenue: acc.totalRevenue + region.revenue,
      totalSpend: acc.totalSpend + region.spend,
      totalImpressions: acc.totalImpressions + region.impressions,
      totalClicks: acc.totalClicks + region.clicks,
      totalConversions: acc.totalConversions + region.conversions
    }), {
      totalRevenue: 0,
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0
    });

    // Find top performing region
    const topRegion = regionalData.reduce((top, current) => 
      current.revenue > (top?.revenue || 0) ? current : top, null as (typeof regionalData[0] | null)
    );

    return {
      ...totals,
      regionalData,
      topRegion
    };
  }, [marketingData?.campaigns, selectedValueKey]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading regional data...</div>
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
                  Regional Performance
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && (
            <>
              {/* Regional Summary Cards */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <Globe className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Regional Performance Summary</h2>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
                  <CardMetric
                    title="Total Revenue"
                    value={`$${regionalMetrics.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                    className="text-green-400"
                  />
                  
                  <CardMetric
                    title="Total Spend"
                    value={`$${regionalMetrics.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    className="text-blue-400"
                  />
                  
                  <CardMetric
                    title="Total Impressions"
                    value={regionalMetrics.totalImpressions.toLocaleString()}
                    icon={<Target className="h-5 w-5" />}
                  />
                  
                  <CardMetric
                    title="Total Clicks"
                    value={regionalMetrics.totalClicks.toLocaleString()}
                    icon={<MousePointer className="h-5 w-5" />}
                  />
                  
                  <CardMetric
                    title="Total Regions"
                    value={regionalMetrics.regionalData.length}
                    icon={<MapPin className="h-5 w-5" />}
                    className="text-purple-400"
                  />
                </div>

                {/* Top Performing Region */}
                {regionalMetrics.topRegion && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Top Performing Region</h3>
                        <p className="text-gray-300">
                          {regionalMetrics.topRegion.region}, {regionalMetrics.topRegion.country}
                        </p>
                        <p className="text-sm text-gray-400">
                          {regionalMetrics.topRegion.campaignCount} campaigns • ROAS: {regionalMetrics.topRegion.roas.toFixed(1)}x
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          ${regionalMetrics.topRegion.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-sm text-gray-400">Revenue</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Heat Map Section */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-lg sm:text-xl font-semibold text-white">Regional Heat Map</h2>
                  </div>
                  
                  {/* Value Key Selector */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedValueKey('revenue')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        selectedValueKey === 'revenue'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Revenue
                    </button>
                    <button
                      onClick={() => setSelectedValueKey('spend')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        selectedValueKey === 'spend'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Spend
                    </button>
                  </div>
                </div>
                
                <HeatMap
                  title={`Regional ${selectedValueKey === 'revenue' ? 'Revenue' : 'Spend'} Distribution`}
                  data={regionalMetrics.regionalData}
                  valueKey={selectedValueKey}
                  height={500}
                />
              </div>

              {/* Regional Performance Table */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <Target className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-white">Detailed Regional Performance</h3>
                </div>
                
                <Table
                  columns={[
                    {
                      key: 'region',
                      header: 'Region',
                      width: '15%',
                      sortable: true,
                      sortType: 'string'
                    },
                    {
                      key: 'country',
                      header: 'Country',
                      width: '12%',
                      sortable: true,
                      sortType: 'string'
                    },
                    {
                      key: 'impressions',
                      header: 'Impressions',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'clicks',
                      header: 'Clicks',
                      width: '8%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'conversions',
                      header: 'Conversions',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => value.toLocaleString()
                    },
                    {
                      key: 'spend',
                      header: 'Spend',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                    },
                    {
                      key: 'revenue',
                      header: 'Revenue',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => (
                        <span className="text-green-400 font-medium">
                          ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      )
                    },
                    {
                      key: 'ctr',
                      header: 'CTR %',
                      width: '8%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `${value.toFixed(2)}%`
                    },
                    {
                      key: 'conversion_rate',
                      header: 'Conv. Rate %',
                      width: '10%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => `${value.toFixed(2)}%`
                    },
                    {
                      key: 'roas',
                      header: 'ROAS',
                      width: '7%',
                      align: 'right',
                      sortable: true,
                      sortType: 'number',
                      render: (value) => (
                        <span className="text-blue-400 font-medium">
                          {value.toFixed(1)}x
                        </span>
                      )
                    }
                  ]}
                  data={regionalMetrics.regionalData}
                  maxHeight="400px"
                  showIndex={true}
                  emptyMessage="No regional data available"
                  defaultSort={{ key: 'revenue', direction: 'desc' }}
                />
              </div>
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
