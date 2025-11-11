import { useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

// API configuration
const API_BASE = 'http://localhost:5000/api';

// API call function
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    console.log(`🔄 Making API call to: ${API_BASE}${url}`);
    const response = await fetch(`${API_BASE}${url}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ API call error:', error);
    throw error;
  }
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    newUsersToday: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // First try the admin users endpoint
      let response;
      try {
        response = await apiCall('/admin/users');
      } catch (error) {
        console.log('Admin users endpoint not available, using test endpoint');
        // Fallback to test endpoint
        response = await apiCall('/auth/test-users');
      }
      
      if (response.success) {
        // Transform the API response to match your component's expected format
        const transformedUsers = response.data.users ? response.data.users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          status: user.is_active ? "active" : "inactive",
          joinDate: user.join_date || user.created_at,
          lastLogin: user.last_login,
          booksBorrowed: user.total_borrowed || 0,
          affiliateStatus: user.affiliate_status,
          totalEarnings: user.total_earnings || 0
        })) : [];

        setUsers(transformedUsers);
        
        // Calculate stats
        const totalUsers = transformedUsers.length;
        const activeUsers = transformedUsers.filter(user => user.status === 'active').length;
        const premiumUsers = transformedUsers.filter(user => user.role === 'premium').length;
        const newUsersToday = transformedUsers.filter(user => {
          const joinDate = new Date(user.joinDate);
          const today = new Date();
          return joinDate.toDateString() === today.toDateString();
        }).length;

        setStats({
          totalUsers,
          activeUsers,
          premiumUsers,
          newUsersToday
        });
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("❌ Error loading users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // TODO: Replace with actual API call when endpoint is available
        // await apiCall(`/admin/users/${id}`, { method: 'DELETE' });
        
        // Update local state temporarily
        setUsers(users.filter((user) => user.id !== id));
        alert('User deleted successfully (demo)');
      } catch (error) {
        console.error("❌ Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const user = users.find(u => u.id === id);
      const newStatus = user.status === "active" ? "inactive" : "active";
      
      // TODO: Replace with actual API call when endpoint is available
      // await apiCall(`/admin/users/${id}/status`, {
      //   method: 'PATCH',
      //   body: { status: newStatus }
      // });
      
      // Update local state temporarily
      setUsers(
        users.map((user) =>
          user.id === id
            ? {
                ...user,
                status: newStatus,
              }
            : user
        )
      );
      
      alert(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully (demo)`);
    } catch (error) {
      console.error("❌ Error updating user status:", error);
      alert("Failed to update user status. Please try again.");
    }
  };

  const handlePromoteToPremium = async (id) => {
    try {
      // TODO: Replace with actual API call when endpoint is available
      // await apiCall(`/admin/users/${id}/role`, {
      //   method: 'PATCH',
      //   body: { role: 'premium' }
      // });
      
      // Update local state temporarily
      setUsers(
        users.map((user) =>
          user.id === id
            ? {
                ...user,
                role: 'premium',
              }
            : user
        )
      );
      
      alert('User promoted to premium successfully (demo)');
    } catch (error) {
      console.error("❌ Error promoting user:", error);
      alert("Failed to promote user. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getRoleBadge = (role) => {
    const styles = {
      user: "bg-gray-100 text-gray-800",
      premium: "bg-blue-100 text-blue-800",
      admin: "bg-purple-100 text-purple-800",
    };
    return styles[role] || styles.user;
  };

  const getAffiliateBadge = (status) => {
    const styles = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      not_applied: "bg-gray-100 text-gray-800",
    };
    return styles[status] || styles.not_applied;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage library users and their permissions
          </p>
        </div>
        <Button>
          <FiPlus className="mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 text-center">
          <FiUser className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </Card>
        <Card className="p-6 text-center">
          <FiCheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {stats.activeUsers}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </Card>
        <Card className="p-6 text-center">
          <FiUser className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {stats.premiumUsers}
          </div>
          <div className="text-sm text-gray-600">Premium Users</div>
        </Card>
        <Card className="p-6 text-center">
          <FiClock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {stats.newUsersToday}
          </div>
          <div className="text-sm text-gray-600">New Today</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <FiFilter className="h-4 w-4 text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affiliate Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FiUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {users.length === 0 ? "No users registered yet" : "No users found"}
                      </h3>
                      <p className="text-gray-600">
                        {users.length === 0
                          ? "Users will appear here once they register."
                          : "Try changing your search or filter criteria."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.joinDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAffiliateBadge(
                          user.affiliateStatus
                        )}`}
                      >
                        {user.affiliateStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          user.status === "active"
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {user.status === "active" ? (
                          <FiXCircle className="mr-1" />
                        ) : (
                          <FiCheckCircle className="mr-1" />
                        )}
                        {user.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      
                      {user.role === 'user' && (
                        <button
                          onClick={() => handlePromoteToPremium(user.id)}
                          className="text-purple-600 hover:text-purple-900 text-xs inline-flex items-center px-2 py-1"
                        >
                          <FiUser className="mr-1" />
                          Make Premium
                        </button>
                      )}
                      
                      <button className="text-blue-600 hover:text-blue-900">
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" onClick={loadUsers}>
            Refresh Users
          </Button>
          <Button variant="outline">
            Export Users List
          </Button>
          <Button variant="outline">
            Send Bulk Email
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UserManagementPage;