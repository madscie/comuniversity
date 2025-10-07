// src/components/Admin/AdminTools.jsx
import React, { useState, useEffect } from 'react';
import EditBookModal from '../../components/Modals/EditBookModal';

const AdminTools = ({ books,  onBookUpdated, onBookDeleted}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'loans') {
      fetchAllLoans();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock user data - replace with actual API call
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', joinDate: '2024-01-01' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', joinDate: '2024-01-02' }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLoans = async () => {
    try {
      setLoading(true);
      // Mock loan data - replace with actual API call
      const mockLoans = [
        { 
          id: 1, 
          bookTitle: 'Sample Book 1', 
          userName: 'John Doe', 
          borrowDate: '2024-01-10',
          dueDate: '2024-01-15',
          status: 'active'
        },
        { 
          id: 2, 
          bookTitle: 'Sample Book 2', 
          userName: 'Jane Smith', 
          borrowDate: '2024-01-12',
          dueDate: '2024-01-20',
          status: 'active'
        }
      ];
      setAllLoans(mockLoans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalBooks: books.length,
    availableBooks: books.filter(book => book.available_copies > 0).length,
    borrowedBooks: books.reduce((sum, book) => sum + (book.total_copies - book.available_copies), 0),
    totalUsers: users.length,
    activeLoans: allLoans.filter(loan => loan.status === 'active').length,
    popularCategory: () => {
      const categories = books.reduce((acc, book) => {
        const category = book.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      
      const mostPopular = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
      return mostPopular ? `${mostPopular[0]} (${mostPopular[1]})` : 'No categories';
    }
  };

  const generateReport = () => {
    const reportData = {
      generatedAt: new Date().toLocaleString(),
      totalBooks: stats.totalBooks,
      availableBooks: stats.availableBooks,
      borrowedBooks: stats.borrowedBooks,
      totalUsers: stats.totalUsers,
      activeLoans: stats.activeLoans,
      popularCategory: stats.popularCategory()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportData = () => {
    const csvContent = [
      ['Title', 'Author', 'ISBN', 'Category', 'Total Copies', 'Available Copies'],
      ...books.map(book => [
        book.title,
        book.author,
        book.isbn,
        book.category || 'Uncategorized',
        book.total_copies,
        book.available_copies
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `books-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteBook = (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      if (onBookDeleted) {
        onBookDeleted(bookId);
      }
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBook(null);
  };

  const handleBookUpdatedFromModal = (updatedBook) => {
    if (onBookUpdated) {
      onBookUpdated(updatedBook);
    }
    closeEditModal();
  };

  const handleBookDeletedFromModal = (bookId) => {
    if (onBookDeleted) {
      onBookDeleted(bookId);
    }
    closeEditModal();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'books', 'users', 'loans', 'reports'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900">Total Books</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalBooks}</p>
              <p className="text-sm text-blue-700 mt-2">+12% from last month</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <h3 className="text-lg font-semibold text-green-900">Available Books</h3>
              <p className="text-3xl font-bold text-green-600">{stats.availableBooks}</p>
              <p className="text-sm text-green-700 mt-2">{Math.round((stats.availableBooks / stats.totalBooks) * 100)}% available</p>
            </div>
            
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
              <h3 className="text-lg font-semibold text-orange-900">Borrowed Books</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.borrowedBooks}</p>
              <p className="text-sm text-orange-700 mt-2">Active loans</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-900">Total Users</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
              <p className="text-sm text-purple-700 mt-2">+5% from last month</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Category</h3>
              <p className="text-2xl font-bold text-gray-700">{stats.popularCategory()}</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Loans</h3>
              <p className="text-2xl font-bold text-gray-700">{stats.activeLoans}</p>
              <p className="text-sm text-gray-600 mt-2">Currently borrowed</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={generateReport}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Report
              </button>
              <button 
                onClick={exportData}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Export Data
              </button>
              <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                System Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Books Management Tab */}
      {activeTab === 'books' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Book Management</h3>
            <span className="text-sm text-gray-600">{books.length} books total</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Copies</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.slice(0, 10).map(book => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{book.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{book.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        book.available_copies > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.available_copies > 0 ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.available_copies}/{book.total_copies}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {book.category || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditBook(book)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteBook(book.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {books.length > 10 && (
              <div className="px-6 py-4 text-sm text-gray-600">
                Showing 10 of {books.length} books
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">User Management ({users.length} users)</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading users...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Loan Management ({allLoans.length} loans)</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading loans...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrow Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allLoans.map(loan => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.bookTitle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.userName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(loan.borrowDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Reports & Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold mb-3">Library Usage Report</h4>
              <p className="text-gray-600 mb-4">Generate comprehensive reports on library usage patterns.</p>
              <button 
                onClick={generateReport}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Generate Report
              </button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold mb-3">Book Popularity Analysis</h4>
              <p className="text-gray-600 mb-4">Analyze which books are most popular among readers.</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                View Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      <EditBookModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        book={editingBook}
        onBookUpdated={handleBookUpdatedFromModal}
        onBookDeleted={handleBookDeletedFromModal}
      />
    </div>
  );
};

export default AdminTools;