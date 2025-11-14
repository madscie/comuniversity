import { useState, useEffect } from 'react';

export const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchAnalytics = async () => {
      setLoading(true);
      
      // Mock data - replace with real API call
      const mockData = {
        overview: {
          totalRevenue: 12547.50,
          activeUsers: 892,
          newRegistrations: 147,
          contentDownloads: 8452,
          conversionRate: 3.2
        },
        userGrowth: [
          { label: 'Jan', value: 1200 },
          { label: 'Feb', value: 1450 },
          { label: 'Mar', value: 1890 },
          { label: 'Apr', value: 2200 },
          { label: 'May', value: 2847 },
          { label: 'Jun', value: 3120 }
        ],
        revenueTrends: [
          { label: 'Week 1', value: 2850 },
          { label: 'Week 2', value: 3200 },
          { label: 'Week 3', value: 2950 },
          { label: 'Week 4', value: 3547 }
        ],
        popularContent: [
          { label: 'React', value: 845, category: 'Programming' },
          { label: 'Marketing', value: 723, category: 'Business' },
          { label: 'Data Science', value: 689, category: 'Technology' },
          { label: 'Design', value: 542, category: 'Creative' },
          { label: 'Finance', value: 489, category: 'Business' }
        ],
        userDemographics: [
          { label: 'Students', value: 45 },
          { label: 'Professionals', value: 30 },
          { label: 'Researchers', value: 15 },
          { label: 'Educators', value: 10 }
        ],
        trafficSources: [
          { label: 'Direct', value: 40 },
          { label: 'Search', value: 35 },
          { label: 'Social', value: 15 },
          { label: 'Referral', value: 10 }
        ],
        engagementMetrics: {
          avgSessionDuration: '12:45',
          pagesPerSession: 4.2,
          bounceRate: 28.5,
          returningVisitors: 42.3
        }
      };

      setTimeout(() => {
        setAnalyticsData(mockData);
        setLoading(false);
      }, 1000);
    };

    fetchAnalytics();
  }, []);

  return { analyticsData, loading };
};