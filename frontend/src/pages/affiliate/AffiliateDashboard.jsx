// pages/affiliate/AffiliateDashboard.jsx
import { useState, useEffect } from "react";
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiCopy,
  FiShare2,
  FiBarChart2,
  FiCalendar,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { useAuthStore } from "../../store/authStore";

const AffiliateDashboard = () => {
  const { user, getAffiliateStats, getAffiliateReferrals } = useAuthStore();
  const [stats, setStats] = useState({
    totalReferrals: 0,
    approvedReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    conversionRate: 0,
  });

  const [recentReferrals, setRecentReferrals] = useState([]);
  const [earningsHistory, setEarningsHistory] = useState([]);

  useEffect(() => {
    if (user?.affiliateCode) {
      // Get real stats from authStore
      const affiliateStats = getAffiliateStats(user.affiliateCode);
      setStats(affiliateStats);

      // Get recent referrals
      const referrals = getAffiliateReferrals(user.affiliateCode);
      const recent = referrals
        .slice(-5)
        .reverse()
        .map((ref) => ({
          id: ref.id,
          name: `User ${ref.referredUserId.substring(0, 8)}`,
          email: `user${ref.referredUserId.substring(0, 8)}@example.com`,
          date: new Date(ref.date).toLocaleDateString(),
          status: ref.status,
          earnings: ref.commission,
        }));
      setRecentReferrals(recent);

      // Generate earnings history (mock for now)
      setEarningsHistory([
        {
          month: "Jan",
          earnings: Math.round(affiliateStats.totalEarnings * 0.2),
        },
        {
          month: "Feb",
          earnings: Math.round(affiliateStats.totalEarnings * 0.3),
        },
        {
          month: "Mar",
          earnings: Math.round(affiliateStats.totalEarnings * 0.5),
        },
      ]);
    }
  }, [user?.affiliateCode, getAffiliateStats, getAffiliateReferrals]);

  const referralLink = `${window.location.origin}/signup?ref=${user?.affiliateCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied to clipboard!");
  };

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Communityersity Library",
        text: "Check out this amazing digital library!",
        url: referralLink,
      });
    } else {
      copyReferralLink();
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );

  if (!user?.isAffiliate) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Card className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Affiliate Access Required
            </h1>
            <p className="text-gray-600 mb-6">
              You need to be an approved affiliate to access this dashboard.
            </p>
            <Button
              onClick={() => (window.location.href = "/affiliate-signup")}
            >
              Apply to Become an Affiliate
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Affiliate Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Track your referrals and earnings in real-time
          </p>
        </div>

        {/* Referral Link Card */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-semibold mb-2">Your Referral Link</h2>
              <p className="text-blue-100 mb-2">
                Share this link to start earning commissions
              </p>
              <div className="flex items-center space-x-2">
                <code className="bg-blue-700 px-3 py-2 rounded text-sm font-mono break-all">
                  {referralLink}
                </code>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={copyReferralLink}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <FiCopy className="mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={shareReferral}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <FiShare2 className="mr-2" />
                Share
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Referrals"
            value={stats.totalReferrals}
            subtitle={`${stats.approvedReferrals} approved`}
            icon={FiUsers}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Earnings"
            value={`$${stats.totalEarnings.toFixed(2)}`}
            subtitle={`$${stats.pendingEarnings.toFixed(2)} pending`}
            icon={FiDollarSign}
            color="bg-green-500"
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            subtitle="Approval success rate"
            icon={FiTrendingUp}
            color="bg-purple-500"
          />
          <StatCard
            title="Your Code"
            value={user?.affiliateCode || "N/A"}
            subtitle="Unique affiliate code"
            icon={FiBarChart2}
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Referrals */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Referrals
              </h3>
            </div>
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Earnings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentReferrals.map((referral) => (
                      <tr key={referral.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {referral.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {referral.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {referral.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              referral.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {referral.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${referral.earnings}
                        </td>
                      </tr>
                    ))}
                    {recentReferrals.length === 0 && (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No referrals yet. Share your link to start earning!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Earnings Chart */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Earnings Overview
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {earningsHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <FiCalendar className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        {item.month} 2024
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FiDollarSign className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-semibold text-gray-900">
                        {item.earnings.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${stats.totalEarnings.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    ${stats.pendingEarnings.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              How It Works
            </h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiShare2 className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Share Your Link</h4>
                <p className="text-sm text-gray-600">
                  Share your unique referral link with friends and followers
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiUsers className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">They Sign Up</h4>
                <p className="text-sm text-gray-600">
                  People sign up using your link and become members
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiDollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Earn Commissions</h4>
                <p className="text-sm text-gray-600">
                  Earn $10 for each successful referral and 10% of their
                  purchases
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
