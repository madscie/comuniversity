import React, { useState, useEffect } from 'react';
import { bookAPI } from '../../services/api';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await bookAPI.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-600">Total Books</h3>
          <p className="text-3xl font-bold text-gray-900">
            {analytics.totalBooks?.[0]?.count || 0}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-600">Total Loans</h3>
          <p className="text-3xl font-bold text-gray-900">
            {analytics.totalLoans?.[0]?.count || 0}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-gray-600">Active Loans</h3>
          <p className="text-3xl font-bold text-gray-900">
            {analytics.activeLoans?.[0]?.count || 0}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-gray-600">Overdue Loans</h3>
          <p className="text-3xl font-bold text-gray-900">
            {analytics.overdueLoans?.[0]?.count || 0}
          </p>
        </div>
      </div>

      {/* Popular Books */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Most Popular Books</h3>
          <div className="space-y-3">
            {analytics.popularBooks?.slice(0, 5).map((book, index) => (
              <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-blue-600">{index + 1}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{book.title}</h4>
                    <p className="text-sm text-gray-600">{book.author}</p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {book.loan_count} loans
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Loans */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Loans</h3>
          <div className="space-y-3">
            {analytics.recentLoans?.slice(0, 5).map((loan) => (
              <div key={loan.id} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{loan.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    loan.status === 'active' 
                      ? loan.due_date < new Date().toISOString().split('T')[0]
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {loan.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Borrowed by: {loan.username}</p>
                  <p>Due: {new Date(loan.due_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section (Placeholder for future chart implementation) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Loan Activity</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p className="text-gray-600">Charts will be implemented with a charting library</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;