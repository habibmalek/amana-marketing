// app/demographic-view/page.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, Campaign, DemographicBreakdown } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Users, User, Target, DollarSign, TrendingUp, MousePointer, Venus, Mars } from 'lucide-react';

export default function DemographicView() {
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

  // Calculate demographic metrics
  const demographicMetrics = useMemo(() => {
    if (!marketingData?.campaigns) {
      return {
        maleClicks: 0,
        maleSpend: 0,
        maleRevenue: 0,
        femaleClicks: 0,
        femaleSpend: 0,
        femaleRevenue: 0,
        ageGroupSpend: [],
        ageGroupRevenue: [],
        maleAgeGroups: [],
        femaleAgeGroups: []
      };
    }

    let maleClicks = 0;
    let maleSpend = 0;
    let maleRevenue = 0;
    let femaleClicks = 0;
    let femaleSpend = 0;
    let femaleRevenue = 0;

    const ageGroupSpendMap: { [key: string]: number } = {};
    const ageGroupRevenueMap: { [key: string]: number } = {};
    const maleAgeGroupMap: { [key: string]: any } = {};
    const femaleAgeGroupMap: { [key: string]: any } = {};

    marketingData.campaigns.forEach((campaign: Campaign) => {
      campaign.demographic_breakdown.forEach((breakdown: DemographicBreakdown) => {
        const { age_group, gender, performance } = breakdown;
        const audiencePercentage = breakdown.percentage_of_audience / 100;

        // Calculate allocated spend and revenue based on audience percentage
        const allocatedSpend = campaign.spend * audiencePercentage;
        const allocatedRevenue = campaign.revenue * audiencePercentage;

        // Initialize age group maps if not exists
        if (!ageGroupSpendMap[age_group]) ageGroupSpendMap[age_group] = 0;
        if (!ageGroupRevenueMap[age_group]) ageGroupRevenueMap[age_group] = 0;

        // Aggregate by gender
        if (gender.toLowerCase() === 'male') {
          maleClicks += performance.clicks;
          maleSpend += allocatedSpend;
          maleRevenue += allocatedRevenue;

          // Initialize male age group data
          if (!maleAgeGroupMap[age_group]) {
            maleAgeGroupMap[age_group] = {
              impressions: 0,
              clicks: 0,
              conversions: 0,
              ctr: 0,
              conversion_rate: 0
            };
          }
          maleAgeGroupMap[age_group].impressions += performance.impressions;
          maleAgeGroupMap[age_group].clicks += performance.clicks;
          maleAgeGroupMap[age_group].conversions += performance.conversions;

        } else if (gender.toLowerCase() === 'female') {
          femaleClicks += performance.clicks;
          femaleSpend += allocatedSpend;
          femaleRevenue += allocatedRevenue;

          // Initialize female age group data
          if (!femaleAgeGroupMap[age_group]) {
            femaleAgeGroupMap[age_group] = {
              impressions: 0,
              clicks: 0,
              conversions: 0,
              ctr: 0,
              conversion_rate: 0
            };
          }
          femaleAgeGroupMap[age_group].impressions += performance.impressions;
          femaleAgeGroupMap[age_group].clicks += performance.clicks;
          femaleAgeGroupMap[age_group].conversions += performance.conversions;
        }

        // Aggregate age group data (across all genders)
        ageGroupSpendMap[age_group] += allocatedSpend;
        ageGroupRevenueMap[age_group] += allocatedRevenue;
      });
    });

    // Calculate CTR and Conversion Rate for age groups
    Object.keys(maleAgeGroupMap).forEach(ageGroup => {
      const data = maleAgeGroupMap[ageGroup];
      data.ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
      data.conversion_rate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
    });

    Object.keys(femaleAgeGroupMap).forEach(ageGroup => {
      const data = femaleAgeGroupMap[ageGroup];
      data.ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
      data.conversion_rate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
    });

    // Convert maps to arrays for charts and tables
    const ageGroupSpend = Object.entries(ageGroupSpendMap).map(([label, value]) => ({
      label,
      value,
      color: '#3B82F6'
    }));

    const ageGroupRevenue = Object.entries(ageGroupRevenueMap).map(([label, value]) => ({
      label,
      value,
      color: '#10B981'
    }));

    const maleAgeGroups = Object.entries(maleAgeGroupMap).map(([age_group, data]) => ({
      age_group,
      ...data
    }));

    const femaleAgeGroups = Object.entries(femaleAgeGroupMap).map(([age_group, data]) => ({
      age_group,
      ...data
    }));

    return {
      maleClicks,
      maleSpend,
      maleRevenue,
      femaleClicks,
      femaleSpend,
      femaleRevenue,
      ageGroupSpend,
      ageGroupRevenue,
      maleAgeGroups,
      femaleAgeGroups
    };
  }, [marketingData?.campaigns]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading demographic data...</div>
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
                  Demographic Insights
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {marketingData && (
            <>
              {/* Gender Performance Cards */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Gender Performance Metrics</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  {/* Male Metrics */}
                  <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
                    <div className="flex items-center mb-4">
                      <Mars className="h-5 w-5 text-blue-400 mr-2" />
                      <h3 className="text-lg font-semibold text-white">Male Audience</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <CardMetric
                        title="Total Clicks"
                        value={demographicMetrics.maleClicks.toLocaleString()}
                        icon={<MousePointer className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Total Spend"
                        value={`$${demographicMetrics.maleSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        icon={<DollarSign className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Total Revenue"
                        value={`$${demographicMetrics.maleRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        icon={<TrendingUp className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                    </div>
                  </div>

                  {/* Female Metrics */}
                  <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
                    <div className="flex items-center mb-4">
                      <Venus className="h-5 w-5 text-pink-400 mr-2" />
                      <h3 className="text-lg font-semibold text-white">Female Audience</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <CardMetric
                        title="Total Clicks"
                        value={demographicMetrics.femaleClicks.toLocaleString()}
                        icon={<MousePointer className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Total Spend"
                        value={`$${demographicMetrics.femaleSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        icon={<DollarSign className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                      <CardMetric
                        title="Total Revenue"
                        value={`$${demographicMetrics.femaleRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        icon={<TrendingUp className="h-4 w-4" />}
                        className="bg-gray-750 border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Age Group Performance Charts */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <Target className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Age Group Performance</h2>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <BarChart
                    title="Total Spend by Age Group"
                    data={demographicMetrics.ageGroupSpend}
                    formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    height={280}
                  />
                  
                  <BarChart
                    title="Total Revenue by Age Group"
                    data={demographicMetrics.ageGroupRevenue}
                    formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    height={280}
                  />
                </div>
              </div>

              {/* Age Group Performance Tables */}
              <div className="space-y-6 sm:space-y-8">
                {/* Male Age Groups Table */}
                <div>
                  <div className="flex items-center mb-4">
                    <Mars className="h-5 w-5 text-blue-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">Male Campaign Performance by Age Groups</h3>
                  </div>
                  
                  <Table
                    columns={[
                      {
                        key: 'age_group',
                        header: 'Age Group',
                        width: '15%',
                        sortable: true,
                        sortType: 'string'
                      },
                      {
                        key: 'impressions',
                        header: 'Impressions',
                        width: '15%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => value.toLocaleString()
                      },
                      {
                        key: 'clicks',
                        header: 'Clicks',
                        width: '12%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => value.toLocaleString()
                      },
                      {
                        key: 'conversions',
                        header: 'Conversions',
                        width: '15%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => value.toLocaleString()
                      },
                      {
                        key: 'ctr',
                        header: 'CTR (%)',
                        width: '14%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => `${value.toFixed(2)}%`
                      },
                      {
                        key: 'conversion_rate',
                        header: 'Conversion Rate (%)',
                        width: '19%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => `${value.toFixed(2)}%`
                      }
                    ]}
                    data={demographicMetrics.maleAgeGroups}
                    maxHeight="400px"
                    showIndex={true}
                    emptyMessage="No male demographic data available"
                    defaultSort={{ key: 'impressions', direction: 'desc' }}
                  />
                </div>

                {/* Female Age Groups Table */}
                <div>
                  <div className="flex items-center mb-4">
                    <Venus className="h-5 w-5 text-pink-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">Female Campaign Performance by Age Groups</h3>
                  </div>
                  
                  <Table
                    columns={[
                      {
                        key: 'age_group',
                        header: 'Age Group',
                        width: '15%',
                        sortable: true,
                        sortType: 'string'
                      },
                      {
                        key: 'impressions',
                        header: 'Impressions',
                        width: '15%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => value.toLocaleString()
                      },
                      {
                        key: 'clicks',
                        header: 'Clicks',
                        width: '12%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => value.toLocaleString()
                      },
                      {
                        key: 'conversions',
                        header: 'Conversions',
                        width: '15%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => value.toLocaleString()
                      },
                      {
                        key: 'ctr',
                        header: 'CTR (%)',
                        width: '14%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => `${value.toFixed(2)}%`
                      },
                      {
                        key: 'conversion_rate',
                        header: 'Conversion Rate (%)',
                        width: '19%',
                        align: 'right',
                        sortable: true,
                        sortType: 'number',
                        render: (value) => `${value.toFixed(2)}%`
                      }
                    ]}
                    data={demographicMetrics.femaleAgeGroups}
                    maxHeight="400px"
                    showIndex={true}
                    emptyMessage="No female demographic data available"
                    defaultSort={{ key: 'impressions', direction: 'desc' }}
                  />
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
