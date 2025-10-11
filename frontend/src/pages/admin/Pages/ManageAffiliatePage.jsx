// pages/admin/Pages/ManageAffiliatePage.jsx
import { useState, useEffect } from "react";
import {
  FiCopy,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiUserCheck,
  FiCheck,
  FiX,
  FiEye,
  FiFilter,
  FiClock,
  FiUserX,
  FiRefreshCw,
  FiBarChart2,
} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import TempModal from "../../../components/UI/Modal";
import { useAuthStore } from "../../../store/authStore";

const ManageAffiliatesPage = () => {
  const {
    getAllAffiliates,
    updateAffiliateStatus,
    getAffiliateStats,
    updateReferralStatus,
  } = useAuthStore();

  const [affiliates, setAffiliates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load affiliates from authStore
  useEffect(() => {
    loadAffiliates();
  }, []);

  const loadAffiliates = () => {
    setIsLoading(true);
    try {
      // Get affiliates from localStorage via authStore
      const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const affiliateApplications = JSON.parse(
        localStorage.getItem("affiliateApplications") || "[]"
      );
      const referrals = JSON.parse(localStorage.getItem("referrals") || "[]");

      // Combine user data with affiliate applications
      const affiliateData = allUsers.map((user) => {
        const application = affiliateApplications.find(
          (app) => app.userId === user.id
        );
        const userReferrals = referrals.filter(
          (ref) => ref.affiliateCode === user.affiliateCode
        );
        const stats = getAffiliateStats(user.affiliateCode);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          code: user.affiliateCode,
          joinDate: user.affiliateSince
            ? new Date(user.affiliateSince).toISOString().split("T")[0]
            : null,
          applicationDate:
            application?.applicationDate || user.joinDate?.split("T")[0],
          referrals: userReferrals.length,
          earnings: stats.totalEarnings,
          status: user.affiliateStatus || "not_applied",
          motivation: application?.motivation || "No motivation provided",
          promotionChannels: application?.promotionChannels || [],
          performance: getPerformanceLevel(stats),
          userData: user,
        };
      });

      // Add pending applications from users who aren't affiliates yet
      const pendingApplications = affiliateApplications
        .filter(
          (app) =>
            !allUsers.some(
              (user) =>
                user.id === app.userId && user.affiliateStatus === "approved"
            )
        )
        .map((app) => {
          const user = allUsers.find((u) => u.id === app.userId);
          return {
            id: app.id,
            name: user?.name || "Unknown User",
            email: user?.email || "Unknown Email",
            code: null,
            joinDate: null,
            applicationDate: app.applicationDate,
            referrals: 0,
            earnings: 0,
            status: "pending",
            motivation: app.motivation,
            promotionChannels: app.promotionChannels,
            performance: null,
            userData: user,
          };
        });

      setAffiliates([...affiliateData, ...pendingApplications]);
    } catch (error) {
      console.error("Error loading affiliates:", error);
      // Fallback to mock data if no real data exists
      setAffiliates(getMockAffiliateData());
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceLevel = (stats) => {
    if (stats.totalReferrals === 0) return null;
    const conversionRate = stats.conversionRate;
    if (conversionRate >= 80) return "excellent";
    if (conversionRate >= 60) return "good";
    if (conversionRate >= 40) return "average";
    return "poor";
  };

  const getMockAffiliateData = () => {
    return [
      {
        id: 1,
        name: "Sarah Johnson",
        email: "sarah@example.com",
        code: "SARAH25",
        joinDate: "2024-01-15",
        applicationDate: "2024-01-10",
        referrals: 12,
        earnings: 240,
        status: "approved",
        motivation:
          "I have a large following of book lovers on my blog and would love to share this amazing library with them.",
        promotionChannels: ["Blog/Website", "Social Media"],
        performance: "excellent",
      },
      {
        id: 2,
        name: "Mike Chen",
        email: "mike@example.com",
        code: "MIKE30",
        joinDate: "2024-02-01",
        applicationDate: "2024-01-28",
        referrals: 8,
        earnings: 160,
        status: "approved",
        motivation:
          "As an educator, I frequently recommend learning resources to my students.",
        promotionChannels: ["Email List", "Social Media"],
        performance: "good",
      },
      {
        id: 3,
        name: "Emily Davis",
        email: "emily@example.com",
        code: "EMILY35",
        joinDate: "2024-03-15",
        applicationDate: "2024-03-10",
        referrals: 3,
        earnings: 30,
        status: "approved",
        motivation:
          "I run a book club and this would be perfect for our members.",
        promotionChannels: ["Social Media", "Email List"],
        performance: "average",
      },
      {
        id: 4,
        name: "Alex Rodriguez",
        email: "alex@example.com",
        code: null,
        joinDate: null,
        applicationDate: "2024-03-18",
        referrals: 0,
        earnings: 0,
        status: "pending",
        motivation:
          "I'm a book influencer on Instagram with 50K followers focused on self-development books.",
        promotionChannels: ["Social Media", "YouTube"],
        performance: null,
      },
      {
        id: 5,
        name: "Jessica Brown",
        email: "jessica@example.com",
        code: null,
        joinDate: null,
        applicationDate: "2024-03-20",
        referrals: 0,
        earnings: 0,
        status: "pending",
        motivation:
          "I have a popular podcast about digital education and would love to feature your library.",
        promotionChannels: ["Podcast", "Social Media"],
        performance: null,
      },
      {
        id: 6,
        name: "David Wilson",
        email: "david@example.com",
        code: null,
        joinDate: null,
        applicationDate: "2024-03-05",
        referrals: 0,
        earnings: 0,
        status: "rejected",
        motivation: "I want to make money online quickly.",
        promotionChannels: ["Social Media"],
        performance: null,
        rejectionReason:
          "Application lacked specific promotion plan and seemed focused only on quick earnings.",
      },
    ];
  };

  const filteredAffiliates = affiliates.filter((affiliate) => {
    const matchesSearch =
      affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (affiliate.code &&
        affiliate.code.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || affiliate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array(8)
      .fill("")
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("");
  };

  const handleApprove = (affiliateId) => {
    const code = generateCode();

    // Update in authStore
    const affiliate = affiliates.find((aff) => aff.id === affiliateId);
    if (affiliate?.userData) {
      updateAffiliateStatus("approved", code);
    }

    // Update local state
    setAffiliates((prev) =>
      prev.map((aff) =>
        aff.id === affiliateId
          ? {
              ...aff,
              status: "approved",
              code: code,
              joinDate: new Date().toISOString().split("T")[0],
            }
          : aff
      )
    );
    setShowApproveModal(false);
    setSelectedAffiliate(null);
  };

  const handleReject = (affiliateId, reason) => {
    // Update in authStore
    const affiliate = affiliates.find((aff) => aff.id === affiliateId);
    if (affiliate?.userData) {
      updateAffiliateStatus("rejected");
    }

    // Update local state
    setAffiliates((prev) =>
      prev.map((aff) =>
        aff.id === affiliateId
          ? { ...aff, status: "rejected", rejectionReason: reason }
          : aff
      )
    );
    setShowRejectModal(false);
    setSelectedAffiliate(null);
  };

  const handleDelete = (affiliateId) => {
    // Remove from applications if it's a pending application
    const affiliateApplications = JSON.parse(
      localStorage.getItem("affiliateApplications") || "[]"
    );
    const updatedApplications = affiliateApplications.filter(
      (app) => app.id !== affiliateId
    );
    localStorage.setItem(
      "affiliateApplications",
      JSON.stringify(updatedApplications)
    );

    // Update local state
    setAffiliates((prev) => prev.filter((aff) => aff.id !== affiliateId));
    setShowDeleteModal(false);
    setSelectedAffiliate(null);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Copied code: ${code}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: {
        color: "bg-green-100 text-green-800",
        icon: FiCheck,
        label: "Approved",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: FiClock,
        label: "Pending",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: FiX,
        label: "Rejected",
      },
      not_applied: {
        color: "bg-gray-100 text-gray-800",
        icon: FiUserX,
        label: "Not Applied",
      },
    };

    const config = statusConfig[status] || statusConfig.not_applied;
    const Icon = config.icon;

    return (
      <span
        className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPerformanceBadge = (performance) => {
    const performanceConfig = {
      excellent: { color: "bg-green-100 text-green-800", label: "Excellent" },
      good: { color: "bg-blue-100 text-blue-800", label: "Good" },
      average: { color: "bg-yellow-100 text-yellow-800", label: "Average" },
      poor: { color: "bg-red-100 text-red-800", label: "Poor" },
    };

    const config = performanceConfig[performance];
    return config ? (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}
      >
        {config.label}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
        No Data
      </span>
    );
  };

  const stats = {
    total: affiliates.length,
    approved: affiliates.filter((a) => a.status === "approved").length,
    pending: affiliates.filter((a) => a.status === "pending").length,
    rejected: affiliates.filter((a) => a.status === "rejected").length,
    totalReferrals: affiliates.reduce((sum, aff) => sum + aff.referrals, 0),
    totalEarnings: affiliates.reduce((sum, aff) => sum + aff.earnings, 0),
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Affiliates
          </h1>
          <p className="text-gray-600">
            Review applications and manage affiliate partners
          </p>
        </div>
        <Button
          onClick={loadAffiliates}
          variant="outline"
          className="flex items-center"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.approved}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {stats.rejected}
          </div>
          <div className="text-sm text-gray-600">Rejected</div>
        </Card>
      </div>

      {/* Earnings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4 text-center">
          <FiBarChart2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalReferrals}
          </div>
          <div className="text-sm text-gray-600">Total Referrals</div>
        </Card>
        <Card className="p-4 text-center">
          <FiBarChart2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">
            ${stats.totalEarnings}
          </div>
          <div className="text-sm text-gray-600">Total Earnings Paid</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search affiliates by name, email, or code..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="not_applied">Not Applied</option>
          </select>
        </div>
      </Card>

      {/* Affiliates Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affiliate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promotion Channels
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAffiliates.map((affiliate) => (
                <tr key={affiliate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {affiliate.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {affiliate.email}
                      </div>
                      {affiliate.code && (
                        <div className="flex items-center space-x-1 mt-1">
                          <code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">
                            {affiliate.code}
                          </code>
                          <button
                            onClick={() => handleCopyCode(affiliate.code)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FiCopy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {affiliate.applicationDate || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {affiliate.promotionChannels.map((channel, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {channel}
                        </span>
                      ))}
                      {affiliate.promotionChannels.length === 0 && (
                        <span className="text-xs text-gray-500">
                          None specified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {affiliate.referrals}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${affiliate.earnings.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(affiliate.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPerformanceBadge(affiliate.performance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAffiliate(affiliate);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Details"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>

                      {affiliate.status === "pending" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAffiliate(affiliate);
                              setShowApproveModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Approve"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAffiliate(affiliate);
                              setShowRejectModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Reject"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setSelectedAffiliate(affiliate);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAffiliates.length === 0 && (
          <div className="text-center py-12">
            <FiUserX className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No affiliates found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {affiliates.length === 0
                ? "No affiliate applications yet."
                : "Try changing your search or filter criteria."}
            </p>
          </div>
        )}
      </Card>

      {/* Application Details Modal */}
      <TempModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAffiliate(null);
        }}
        title="Affiliate Application Details"
        size="lg"
      >
        {selectedAffiliate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedAffiliate.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedAffiliate.email}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Motivation
              </label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                {selectedAffiliate.motivation}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Promotion Channels
              </label>
              <div className="mt-1 flex flex-wrap gap-2">
                {selectedAffiliate.promotionChannels.map((channel, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {channel}
                  </span>
                ))}
                {selectedAffiliate.promotionChannels.length === 0 && (
                  <span className="text-sm text-gray-500">
                    No channels specified
                  </span>
                )}
              </div>
            </div>

            {selectedAffiliate.rejectionReason && (
              <div>
                <label className="block text-sm font-medium text-gray-700 text-red-600">
                  Rejection Reason
                </label>
                <p className="mt-1 text-sm text-gray-900 bg-red-50 p-3 rounded">
                  {selectedAffiliate.rejectionReason}
                </p>
              </div>
            )}
          </div>
        )}
      </TempModal>

      {/* Approve Confirmation Modal */}
      <TempModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedAffiliate(null);
        }}
        title="Approve Affiliate"
        size="sm"
      >
        <div className="text-center">
          <FiCheck className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Approve Affiliate
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Are you sure you want to approve {selectedAffiliate?.name}'s
            affiliate application?
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveModal(false);
                setSelectedAffiliate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => handleApprove(selectedAffiliate?.id)}
            >
              <FiCheck className="mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </TempModal>

      {/* Reject Confirmation Modal */}
      <TempModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedAffiliate(null);
        }}
        title="Reject Affiliate Application"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <FiX className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Reject Application
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Are you sure you want to reject {selectedAffiliate?.name}'s
              affiliate application?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for rejection (optional)
            </label>
            <textarea
              id="rejectionReason"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide feedback for the applicant..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedAffiliate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                const reason = document.getElementById("rejectionReason").value;
                handleReject(selectedAffiliate?.id, reason);
              }}
            >
              <FiX className="mr-2" />
              Reject Application
            </Button>
          </div>
        </div>
      </TempModal>

      {/* Delete Confirmation Modal */}
      <TempModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAffiliate(null);
        }}
        title="Delete Affiliate"
        size="sm"
      >
        <div className="text-center">
          <FiTrash2 className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Delete Affiliate
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Are you sure you want to delete {selectedAffiliate?.name}'s
            affiliate record? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedAffiliate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(selectedAffiliate?.id)}
            >
              <FiTrash2 className="mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </TempModal>
    </div>
  );
};

export default ManageAffiliatesPage;
