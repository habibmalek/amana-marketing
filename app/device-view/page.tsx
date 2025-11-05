// app/device-view/page.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, Campaign, DevicePerformance } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Smartphone, Monitor, TrendingUp, DollarSign, MousePointer, Target, Users, Zap, BarChart3 } from 'lucide-react';

export default function DeviceView() {
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

  // Calculate device performance metrics
  const deviceMetrics = useMemo(() => {
    if (!marketingData?.campaigns) {
      return {
        mobile: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          revenue: 0,
          ctr: 0,
          conversion_rate: 0,
          percentage_of_traffic: 0,
          campaignCount: 0
        },
        desktop: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          revenue: 0,
          ctr: 0,
          conversion_rate: 0,
          percentage_of_traffic: 0,
          campaignCount: 0
        },
        deviceComparison: [],
        performanceByCampaign: [],
        roasComparison: [],
        conversionRateComparison: []
      };
    }

    let mobileData = {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      revenue: 0,
      ctr: 0,
      conversion_rate: 0,
      percentage_of_traffic: 0,
      campaignCount: 0
    };

    let desktopData = {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      revenue: 0,
      ctr: 0,
      conversion_rate: 0,
      percentage_of_traffic: 0,
      campaignCount: 0
    };

    const performanceByCampaign: any[] = [];

    marketingData.campaigns.forEach((campaign: Campaign) => {
      campaign.device_performance.forEach((device: DevicePerformance) => {
        if (device.device === 'Mobile') {
          mobileData.impressions += device.impressions;
          mobileData.clicks += device.clicks;
          mobileData.conversions += device.conversions;
          mobileData.spend += device.spend;
          mobileData.revenue += device.revenue;
          mobileData.campaignCount += 1;
        } else if (device.device === 'Desktop') {
          desktopData.impressions += device.impressions;
          desktopData.clicks += device.clicks;
          desktopData.conversions += device.conversions;
          desktopData.spend += device.spend;
          desktopData.revenue += device.revenue;
          desktopData.campaignCount += 1;
        }

        // Add to campaign performance breakdown
        performanceByCampaign.push({
          campaignName: campaign.name,
          device: device.device,
          impressions: device.impressions,
          clicks: device.clicks,
          conversions: device.conversions,
          spend: device.spend,
          revenue: device.revenue,
          ctr: device.ctr,
          conversion_rate: device.conversion_rate,
          roas: device.spend > 0 ? device.revenue / device.spend : 0
        });
      });
    });

    // Calculate derived metrics
    mobileData.ctr = mobileData.impressions > 0 ? (mobileData.clicks / mobileData.impressions) * 100 : 0;
    mobileData.conversion_rate = mobileData.clicks > 0 ? (mobileData.conversions / mobileData.clicks) * 100 : 0;
    mobileData.percentage_of_traffic = mobileData.impressions / (mobileData.impressions + desktopData.impressions) * 100;

    desktopData.ctr = desktopData.impressions > 0 ? (desktopData.clicks / desktopData.impressions) * 100 : 0;
    desktopData.conversion_rate = desktopData.clicks > 0 ? (desktopData.conversions / desktopData.clicks) * 100 : 0;
    desktopData.percentage_of_traffic = desktopData.impressions / (mobileData.impressions + desktopData.impressions) * 100;

    // Prepare data for charts
    const deviceComparison = [
      {
        label: 'Mobile',
        value: mobileData.revenue,
        color: '#3B82F6'
      },
      {
        label: 'Desktop',
        value: desktopData.revenue,
        color: '#10B981'
      }
    ];

    const roasComparison = [
      {
        label: 'Mobile',
        value: mobileData.spend > 0 ? mobileData.revenue / mobileData.spend : 0,
        color: '#3B82F6'
      },
      {
        label: 'Desktop',
        value: desktopData.spend > 0 ? desktopData.revenue / desktopData.spend : 0,
        color: '#10B981'
      }
    ];

    const conversionRateComparison = [
      {
        label: 'Mobile',
        value: mobileData.conversion_rate,
        color: '#3B82F6'
      },
      {
        label: 'Desktop',
        value: desktopData.conversion_rate,
        color: '#10B981'
      }
    ];

    return {
      mobile: mobileData,
      desktop: desktopData,
      deviceComparison,
      performanceByCampaign,
      roasComparison,
      conversionRateComparison
    };
  }, [marketingData?.campaigns]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading device performance data...</div>
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
                  Device Performance
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && (
            <>
              {/* Device Performance Summary */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <BarChart3 className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Device Performance Summary</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  {/* Mobile Performance */}
                  <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-blue-700/50">
                    <div className="flex items-center mb-4">
                      <Smartphone className="h-6 w-6 text-blue-400 mr-2" />
                      <h3 className="text-xl font-semibold text-white">Mobile Performance</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <CardMetric
                        title="Impressions"
                        value={deviceMetrics.mobile.impressions.toLocaleString()}
                        icon={<Target className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Clicks"
                        value={deviceMetrics.mobile.clicks.toLocaleString()}
                        icon={<MousePointer className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Conversions"
                        value={deviceMetrics.mobile.conversions.toLocaleString()}
                        icon={<Users className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Spend"
                        value={`$${deviceMetrics.mobile.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        icon={<DollarSign className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Revenue"
                        value={`$${deviceMetrics.mobile.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        icon={<TrendingUp className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Traffic Share"
                        value={`${deviceMetrics.mobile.percentage_of_traffic.toFixed(1)}%`}
                        icon={<Zap className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <CardMetric
                        title="CTR"
                        value={`${deviceMetrics.mobile.ctr.toFixed(2)}%`}
                        className="bg-blue-900/30 border-blue-700 text-blue-300"
                      />
                      <CardMetric
                        title="Conversion Rate"
                        value={`${deviceMetrics.mobile.conversion_rate.toFixed(2)}%`}
                        className="bg-green-900/30 border-green-700 text-green-300"
                      />
                    </div>
                  </div>

                  {/* Desktop Performance */}
                  <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-green-700/50">
                    <div className="flex items-center mb-4">
                      <Monitor className="h-6 w-6 text-green-400 mr-2" />
                      <h3 className="text-xl font-semibold text-white">Desktop Performance</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <CardMetric
                        title="Impressions"
                        value={deviceMetrics.desktop.impressions.toLocaleString()}
                        icon={<Target className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Clicks"
                        value={deviceMetrics.desktop.clicks.toLocaleString()}
                        icon={<MousePointer className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Conversions"
                        value={deviceMetrics.desktop.conversions.toLocaleString()}
                        icon={<Users className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Spend"
                        value={`$${deviceMetrics.desktop.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        icon={<DollarSign className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Revenue"
                        value={`$${deviceMetrics.desktop.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        icon={<TrendingUp className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Traffic Share"
                        value={`${deviceMetrics.desktop.percentage_of_traffic.toFixed(1)}%`}
                        icon={<Zap className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <CardMetric
                        title="CTR"
                        value={`${deviceMetrics.desktop.ctr.toFixed(2)}%`}
                        className="bg-blue-900/30 border-blue-700 text-blue-300"
                      />
                      <CardMetric
                        title="Conversion Rate"
                        value={`${deviceMetrics.desktop.conversion_rate.toFixed(2)}%`}
                        className="bg-green-900/30 border-green-700 text-green-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Comparison Charts */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Device Performance Comparison</h2>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                  <BarChart
                    title="Revenue Comparison"
                    data={deviceMetrics.deviceComparison}
                    formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    height={250}
                  />
                  
                  <BarChart
                    title="ROAS Comparison"
                    data={deviceMetrics.roasComparison}
                    formatValue={(value) => `${value.toFixed(1)}x`}
                    height={250}
                  />
                  
                  <BarChart
                    title="Conversion Rate Comparison"
                    data={deviceMetrics.conversionRateComparison}
                    formatValue={(value) => `${value.toFixed(2)}%`}
                    height={250}
                  />
                </div>
              </div>

              {/* Key Metrics Comparison */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <Zap className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Key Metrics Comparison</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <CardMetric
                    title="Mobile ROAS"
                    value={`${(deviceMetrics.mobile.spend > 0 ? deviceMetrics.mobile.revenue / deviceMetrics.mobile.spend : 0).toFixed(1)}x`}
                    icon={<TrendingUp className="h-5 w-5" />}
                    className={deviceMetrics.mobile.revenue / deviceMetrics.mobile.spend > deviceMetrics.desktop.revenue / deviceMetrics.desktop.spend ? 'text-green-400 border-green-600' : 'text-blue-400'}
                  />
                  
                  <CardMetric
                    title="Desktop ROAS"
                    value={`${(deviceMetrics.desktop.spend > 0 ? deviceMetrics.desktop.revenue / deviceMetrics.desktop.spend : 0).toFixed(1)}x`}
                    icon={<TrendingUp className="h-5 w-5" />}
                    className={deviceMetrics.desktop.revenue / deviceMetrics.desktop.spend > deviceMetrics.mobile.revenue / deviceMetrics.mobile.spend ? 'text-green-400 border-green-600' : 'text-blue-400'}
                  />
                  
                  <CardMetric
                    title="Mobile CPA"
                    value={`$${deviceMetrics.mobile.conversions > 0 ? (deviceMetrics.mobile.spend / deviceMetrics.mobile.conversions).toFixed(2) : '0'}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    className="text-purple-400"
                  />
                  
                  <CardMetric
                    title="Desktop CPA"
                    value={`$${deviceMetrics.desktop.conversions > 0 ? (deviceMetrics.desktop.spend / deviceMetrics.desktop.conversions).toFixed(2) : '0'}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    className="text-purple-400"
                  />
                </div>
              </div>

              {/* Campaign Performance by Device */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4">
                  <Target className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-white">Campaign Performance by Device</h3>
                </div>
                
                <Table
                  columns={[
                    {
                      key: 'campaignName',
                      header: 'Campaign Name',
                      width: '25%',
                      sortable: true,
                      sortType: 'string',
                      render: (value) => (
                        <div className="font-medium text-white text-sm">
                          {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                        </div>
                      )
                    },
                    {
                      key: 'device',
                      header: 'Device',
                      width: '10%',
                      align: 'center',
                      sortable: true,
                      sortType: 'string',
                      render: (value) => (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          value === 'Mobile' 
                            ? 'bg-blue-900 text-blue-300' 
                            : 'bg-green-900 text-green-300'
                        }`}>
                          {value}
                        </span>
                      )
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
                      key: 'roas',
                      header: 'ROAS',
                      width: '9%',
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
                  data={deviceMetrics.performanceByCampaign}
                  maxHeight="400px"
                  showIndex={true}
                  emptyMessage="No device performance data available"
                  defaultSort={{ key: 'revenue', direction: 'desc' }}
                />
              </div>

              {/* Performance Insights */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Device Performance Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
                    <h4 className="font-semibold text-blue-400 mb-2">Mobile Performance</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• {deviceMetrics.mobile.percentage_of_traffic.toFixed(1)}% of total traffic</li>
                      <li>• ${deviceMetrics.mobile.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} total revenue</li>
                      <li>• {deviceMetrics.mobile.conversion_rate.toFixed(2)}% conversion rate</li>
                      <li>• {(deviceMetrics.mobile.spend > 0 ? deviceMetrics.mobile.revenue / deviceMetrics.mobile.spend : 0).toFixed(1)}x ROAS</li>
                    </ul>
                  </div>
                  <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
                    <h4 className="font-semibold text-green-400 mb-2">Desktop Performance</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• {deviceMetrics.desktop.percentage_of_traffic.toFixed(1)}% of total traffic</li>
                      <li>• ${deviceMetrics.desktop.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} total revenue</li>
                      <li>• {deviceMetrics.desktop.conversion_rate.toFixed(2)}% conversion rate</li>
                      <li>• {(deviceMetrics.desktop.spend > 0 ? deviceMetrics.desktop.revenue / deviceMetrics.desktop.spend : 0).toFixed(1)}x ROAS</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
