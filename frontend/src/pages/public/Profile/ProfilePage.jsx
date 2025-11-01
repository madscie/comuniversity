// src/pages/public/Profile/ProfilePage.jsx
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
      color: "text-gray-500 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-700",
      title: "Become an Affiliate",
      description: "Earn commissions by referring new members",
      buttonText: "Apply Now",
      action: handleApplyAffiliate,
    },
    pending: {
      icon: FiClock,
      color: "text-yellow-500 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      title: "Application Pending",
      description: "Your affiliate application is under review",
      buttonText: "View Status",
      action: handleViewStatus,
    },
    approved: {
      icon: FiCheck,
      color: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      title: "Active Affiliate",
      description: "You're part of our affiliate program",
      buttonText: "View Dashboard",
      action: handleViewDashboard,
    },
    rejected: {
      icon: FiX,
      color: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      title: "Application Rejected",
      description: "Your affiliate application was not approved",
      buttonText: "Reapply",
      action: handleApplyAffiliate,
    },
  };

  const currentStatus = statusConfig[affiliateData.status];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-4 sm:py-6 lg:py-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your account and reading preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Profile Information Card */}
            <Card className="dark:shadow-gray-900/50">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Personal Information
                </h2>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-4 sm:space-x-6 mb-4 sm:mb-6">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                    <FiUser className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      {user?.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base flex items-center">
                      <FiMail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {user?.email}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm flex items-center">
                      <FiCalendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Member since {formData.joinDate}
                    </p>
                    {user?.role === "admin" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 mt-1">
                        Administrator
                      </span>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <Button
                        onClick={handleSave}
                        className="text-sm sm:text-base"
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="text-sm sm:text-base"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">
                      {formData.bio}
                    </p>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="text-sm sm:text-base"
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Affiliate Status Card - Only show for non-admin users */}
            {user?.role !== "admin" && (
              <Card className="dark:shadow-gray-900/50">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Affiliate Program
                  </h2>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div
                        className={`p-2 sm:p-3 rounded-full ${currentStatus.bgColor}`}
                      >
                        <currentStatus.icon
                          className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${currentStatus.color}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          {currentStatus.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                          {currentStatus.description}
                        </p>

                        {/* Show affiliate code if approved */}
                        {affiliateData.status === "approved" &&
                          affiliateData.code && (
                            <div className="mt-1 sm:mt-2">
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Your referral code:
                              </p>
                              <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs sm:text-sm font-mono text-gray-900 dark:text-gray-100">
                                  {affiliateData.code}
                                </code>
                                <button
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      affiliateData.code
                                    )
                                  }
                                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-xs sm:text-sm"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    <Button
                      onClick={currentStatus.action}
                      className="text-xs sm:text-sm w-full sm:w-auto"
                    >
                      {currentStatus.buttonText}
                    </Button>
                  </div>

                  {/* Show stats if approved */}
                  {affiliateData.status === "approved" && (
                    <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                          {affiliateData.totalReferrals}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Total Referrals
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                          ${affiliateData.totalEarnings.toFixed(2)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
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
          <div className="space-y-4 sm:space-y-6">
            {/* Reading Stats */}
            <Card className="dark:shadow-gray-900/50">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Reading Stats
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 mr-2 sm:mr-3" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                        {stat.label}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="dark:shadow-gray-900/50">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to="/my-library"
                  className="block text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm sm:text-base"
                >
                  My Library
                </Link>
                <Link
                  to="/browse"
                  className="block text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm sm:text-base"
                >
                  Browse Books
                </Link>
                <Link
                  to="/articles"
                  className="block text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm sm:text-base"
                >
                  Read Articles
                </Link>

                {/* Affiliate quick link */}
                {user?.role !== "admin" &&
                  affiliateData.status === "approved" && (
                    <Link
                      to="/affiliate-dashboard"
                      className="block text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm sm:text-base"
                    >
                      Affiliate Dashboard
                    </Link>
                  )}

                {/* Admin quick link */}
                {user?.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="block text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-sm sm:text-base"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </Card>

            {/* Affiliate Earnings Preview */}
            {user?.role !== "admin" && affiliateData.status === "approved" && (
              <Card className="dark:shadow-gray-900/50">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Earnings Summary
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      Available:
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400 text-sm sm:text-base">
                      ${affiliateData.totalEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      Pending:
                    </span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400 text-sm sm:text-base">
                      ${affiliateData.pendingEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base">
                      Total:
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
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
