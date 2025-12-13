// src/pages/admin/Pages/UserManagementPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
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
  FiDownload,
  FiSend,
  FiRefreshCw
} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

// API configuration
const API_BASE = 'http://localhost:5000/api';

const UserManagementPage = () => {
  const { isLoaded, userId, isSignedIn, getToken } = useAuth();
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

  // API call function
  const apiCall = async (url, options = {}) => {
    const token = await getToken();
    
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

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadUsers();
    }
  }, [isLoaded, isSignedIn]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Call your backend endpoint to get users
      const response = await apiCall('/admin/users');
      
      if (response.success) {
        // Transform the data
        const transformedUsers = response.data.users.map(user => ({
          id: user._id || user.id,
          clerkId: user.clerkId,
          name: user.name || user.email?.split('@')[0] || 'Unknown User',
          email: user.email,
          role: user.role || 'user',
          status: user.is_active ? "active" : "inactive",
          joinDate: user.created_at || user.join_date || new Date().toISOString(),
          lastLogin: user.last_login || user.updated_at,
          profileImage: user.profile_image,
          booksBorrowed: user.books_borrowed || 0,
          affiliateStatus: user.affiliate_status || 'not_applied',
          totalEarnings: user.total_earnings || 0,
          is_active: Boolean(user.is_active)
        }));

        setUsers(transformedUsers);
        
        // Calculate stats
        const totalUsers = transformedUsers.length;
        const activeUsers = transformedUsers.filter(user => user.is_active).length;
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
      // Fallback to static data or empty array
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
      filterStatus === "all" || (filterStatus === "active" ? user.is_active : !user.is_active);

    return matchesSearch && matchesFilter;
  });

  const handleSyncClerkUsers = async () => {
    try {
      const response = await apiCall('/admin/users/sync-clerk', { 
        method: 'POST' 
      });
      
      if (response.success) {
        alert('✅ Users synced from Clerk successfully!');
        loadUsers();
      }
    } catch (error) {
      console.error("Error syncing Clerk users:", error);
      alert("Failed to sync users. Check backend logs.");
    }
  };

  const handleUpdateUser = async (id, updates) => {
    try {
      const response = await apiCall(`/admin/users/${id}`, {
        method: 'PUT',
        body: updates
      });
      
      if (response.success) {
        loadUsers(); // Refresh the list
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Error updating user:", error);
      return false;
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await apiCall(`/admin/users/${id}`, { 
          method: 'DELETE' 
        });
        
        if (response.success) {
          setUsers(users.filter((user) => user.id !== id));
          alert('✅ User deleted successfully');
        }
      } catch (error) {
        console.error("❌ Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const user = users.find(u => u.id === id);
    const newStatus = !user.is_active;
    
    const success = await handleUpdateUser(id, { is_active: newStatus });
    if (success) {
      alert(`✅ User ${newStatus ? 'activated' : 'deactivated'} successfully`);
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    const success = await handleUpdateUser(id, { role: newRole });
    if (success) {
      alert(`✅ User role updated to ${newRole} successfully`);
    }
  };

  const handleUpdateAffiliateStatus = async (id, newStatus) => {
    const success = await handleUpdateUser(id, { affiliate_status: newStatus });
    if (success) {
      alert(`✅ Affiliate status updated to ${newStatus} successfully`);
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive
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

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please sign in to access user management.</p>
        <Button onClick={() => window.location.href = '/sign-in'}>
          Sign In
        </Button>
      </div>
    );
  }

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
            Manage users synchronized from Clerk authentication
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSyncClerkUsers}>
            <FiRefreshCw className="mr-2" />
            Sync Clerk Users
          </Button>
          <Button onClick={() => window.location.href = 'https://dashboard.clerk.com/apps'}>
            <FiPlus className="mr-2" />
            Add User (Clerk)
          </Button>
        </div>
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
                        {users.length === 0 ? "No users found" : "No matching users"}
                      </h3>
                      <p className="text-gray-600">
                        {users.length === 0
                          ? "Click 'Sync Clerk Users' to import users from Clerk."
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
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                          {user.profileImage ? (
                            <img 
                              src={user.profileImage} 
                              alt={user.name}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center">
                              <FiUser className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
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
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-3 py-1 ${getRoleBadge(user.role)} border-0 focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="user">User</option>
                        <option value="premium">Premium</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.affiliateStatus}
                        onChange={(e) => handleUpdateAffiliateStatus(user.id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-3 py-1 ${getAffiliateBadge(user.affiliateStatus)} border-0 focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="not_applied">Not Applied</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(user.is_active)}`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`text-xs ${user.is_active ? "text-red-600" : "text-green-600"}`}
                        title={user.is_active ? "Deactivate" : "Activate"}
                      >
                        {user.is_active ? <FiXCircle /> : <FiCheckCircle />}
                      </button>
                      <button
                        onClick={() => window.open(`/admin/users/${user.id}/edit`, '_blank')}
                        className="text-blue-600"
                        title="Edit"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600"
                        title="Delete"
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
            <FiRefreshCw className="mr-2" />
            Refresh Users
          </Button>
          <Button variant="outline" onClick={handleSyncClerkUsers}>
            <FiRefreshCw className="mr-2" />
            Sync Clerk Users
          </Button>
          <Button variant="outline">
            <FiDownload className="mr-2" />
            Export Users List
          </Button>
          <Button variant="outline">
            <FiSend className="mr-2" />
            Send Bulk Email
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UserManagementPage;