import { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiBook,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiCheck,
  FiClock,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

const Profile = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "Book enthusiast and lifelong learner",
    joinDate: user?.joinDate
      ? new Date(user.joinDate).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "January 2024",
  });

  // Get affiliate data from user store
  const affiliateData = {
    status: user?.affiliateStatus || "not_applied",
    code: user?.affiliateCode || null,
    totalReferrals: user?.totalReferrals || 0,
    activeReferrals: user?.activeReferrals || 0,
    totalEarnings: user?.totalEarnings || 0,
    pendingEarnings: user?.pendingEarnings || 0,
    joinDate: user?.affiliateSince
      ? new Date(user.affiliateSince).toLocaleDateString()
      : null,
  };

  const stats = [
    { label: "Books Read", value: "24", icon: FiBook },
    { label: "Currently Reading", value: "3", icon: FiBook },
    { label: "Want to Read", value: "12", icon: FiBook },
  ];

  const handleSave = () => {
    console.log("Saving profile:", formData);
    setIsEditing(false);
    // In a real app, you would update the user data in your store/backend here
  };

  const handleApplyAffiliate = () => {
    navigate("/affiliate-signup");
  };

  const handleViewDashboard = () => {
    navigate("/affiliate-dashboard");
  };

  const handleViewStatus = () => {
    navigate("/affiliate-status");
  };

  // Status configurations
  const statusConfig = {
    not_applied: {
      icon: FiUsers,
      color: "text-gray-500",
      bgColor: "bg-gray-100",
      title: "Become an Affiliate",
      description: "Earn commissions by referring new members",
      buttonText: "Apply Now",
      action: handleApplyAffiliate,
    },
    pending: {
      icon: FiClock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
      title: "Application Pending",
      description: "Your affiliate application is under review",
      buttonText: "View Status",
      action: handleViewStatus,
    },
    approved: {
      icon: FiCheck,
      color: "text-green-500",
      bgColor: "bg-green-100",
      title: "Active Affiliate",
      description: "You're part of our affiliate program",
      buttonText: "View Dashboard",
      action: handleViewDashboard,
    },
    rejected: {
      icon: FiX,
      color: "text-red-500",
      bgColor: "bg-red-100",
      title: "Application Rejected",
      description: "Your affiliate application was not approved",
      buttonText: "Reapply",
      action: handleApplyAffiliate,
    },
  };

  const currentStatus = statusConfig[affiliateData.status];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your account and reading preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information Card */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h2>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-6 mb-6">
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                    <FiUser className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {user?.name}
                    </h3>
                    <p className="text-gray-600 flex items-center">
                      <FiMail className="h-4 w-4 mr-2" />
                      {user?.email}
                    </p>
                    <p className="text-gray-500 text-sm flex items-center">
                      <FiCalendar className="h-4 w-4 mr-2" />
                      Member since {formData.joinDate}
                    </p>
                    {user?.role === "admin" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                        Administrator
                      </span>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button onClick={handleSave}>Save Changes</Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 mb-4">{formData.bio}</p>
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Affiliate Status Card - Only show for non-admin users */}
            {user?.role !== "admin" && (
              <Card>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Affiliate Program
                  </h2>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-full ${currentStatus.bgColor}`}
                      >
                        <currentStatus.icon
                          className={`h-6 w-6 ${currentStatus.color}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {currentStatus.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {currentStatus.description}
                        </p>

                        {/* Show affiliate code if approved */}
                        {affiliateData.status === "approved" &&
                          affiliateData.code && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                Your referral code:
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                  {affiliateData.code}
                                </code>
                                <button
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      affiliateData.code
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    <Button onClick={currentStatus.action}>
                      {currentStatus.buttonText}
                    </Button>
                  </div>

                  {/* Show stats if approved */}
                  {affiliateData.status === "approved" && (
                    <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {affiliateData.totalReferrals}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Referrals
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${affiliateData.totalEarnings.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Earnings
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Reading Stats */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reading Stats
              </h3>
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <stat.icon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to="/my-library"
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                >
                  My Library
                </Link>
                <Link
                  to="/browse"
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse Books
                </Link>
                <Link
                  to="/articles"
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                >
                  Read Articles
                </Link>

                {/* Affiliate quick link */}
                {user?.role !== "admin" &&
                  affiliateData.status === "approved" && (
                    <Link
                      to="/affiliate-dashboard"
                      className="block text-green-600 hover:text-green-700 font-medium"
                    >
                      Affiliate Dashboard
                    </Link>
                  )}

                {/* Admin quick link */}
                {user?.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="block text-red-600 hover:text-red-700 font-medium"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </Card>

            {/* Affiliate Earnings Preview */}
            {user?.role !== "admin" && affiliateData.status === "approved" && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Earnings Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-semibold text-green-600">
                      ${affiliateData.totalEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-semibold text-yellow-600">
                      ${affiliateData.pendingEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-800 font-medium">Total:</span>
                    <span className="font-bold text-gray-900">
                      $
                      {(
                        affiliateData.totalEarnings +
                        affiliateData.pendingEarnings
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
