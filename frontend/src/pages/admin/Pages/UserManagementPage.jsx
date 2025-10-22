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
} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/users');
      // const data = await response.json();
      // setUsers(data);
      
      // Temporary empty state until backend is ready
      setUsers([]);
    } catch (error) {
      console.error("Error loading users:", error);
      // Empty state on error
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatDateTime = (dateString) => {
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
        // TODO: Replace with actual API call
        // await fetch(`/api/admin/users/${id}`, {
        //   method: 'DELETE'
        // });
        
        // Update local state temporarily
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const user = users.find(u => u.id === id);
      const newStatus = user.status === "active" ? "inactive" : "active";
      
      // TODO: Replace with actual API call
      // await fetch(`/api/admin/users/${id}/status`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
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
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status. Please try again.");
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
                  Books Borrowed
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
                        No users found
                      </h3>
                      <p className="text-gray-600">
                        {users.length === 0
                          ? "No users registered yet."
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.booksBorrowed || 0}
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card className="p-6 text-center">
          <FiUser className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {users.filter((u) => u.status === "active").length}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {users.filter((u) => u.role === "premium").length}
          </div>
          <div className="text-sm text-gray-600">Premium Users</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {users.reduce((sum, user) => sum + (user.booksBorrowed || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Books Borrowed</div>
        </Card>
      </div>
    </div>
  );
};

export default UserManagementPage;