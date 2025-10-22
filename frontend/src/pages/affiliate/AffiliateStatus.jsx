import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClock,
  FiCheck,
  FiX,
  FiInfo,
  FiArrowLeft,
  FiMail,
  FiCalendar,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { useAuthStore } from "../../store/authStore";

const AffiliateStatus = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplicationData();
  }, [user]);

  const loadApplicationData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/affiliate/application/${user?.id}`);
      // const applicationData = await response.json();
      // setApplication(applicationData);

      // Temporary empty state until backend is ready
      if (user?.affiliateStatus) {
        setApplication({
          status: user.affiliateStatus,
          submittedDate: user.joinDate?.split("T")[0] || new Date().toISOString().split("T")[0],
          // These will come from the actual application data in the backend
          motivation: "",
          promotionChannels: [],
          estimatedReviewTime: "24-48 hours",
        });
      } else {
        setApplication(null);
      }
    } catch (error) {
      console.error("Error loading application data:", error);
      setApplication(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: FiClock,
        color: "text-yellow-500",
        bgColor: "bg-yellow-100",
        title: "Application Under Review",
        description: "Your affiliate application is being reviewed by our team.",
        timeline: [
          {
            step: "Application Submitted",
            status: "completed",
            date: application?.submittedDate || "Recently",
          },
          { step: "Under Review", status: "current", date: "In progress" },
          { step: "Decision", status: "pending", date: "Pending" },
        ],
      },
      approved: {
        icon: FiCheck,
        color: "text-green-500",
        bgColor: "bg-green-100",
        title: "Application Approved!",
        description: "Congratulations! Your affiliate application has been approved.",
        timeline: [
          {
            step: "Application Submitted",
            status: "completed",
            date: application?.submittedDate || "Recently",
          },
          { step: "Under Review", status: "completed", date: "Completed" },
          { step: "Approved", status: "completed", date: new Date().toLocaleDateString() },
        ],
      },
      rejected: {
        icon: FiX,
        color: "text-red-500",
        bgColor: "bg-red-100",
        title: "Application Not Approved",
        description: "We're sorry, but your affiliate application was not approved at this time.",
        timeline: [
          {
            step: "Application Submitted",
            status: "completed",
            date: application?.submittedDate || "Recently",
          },
          { step: "Under Review", status: "completed", date: "Completed" },
          { step: "Not Approved", status: "completed", date: new Date().toLocaleDateString() },
        ],
      },
    };

    return configs[status] || configs.pending;
  };

  const handleGoToDashboard = () => {
    if (user?.affiliateStatus === "approved") {
      navigate("/affiliate-dashboard");
    } else {
      alert(
        "Your affiliate application is still under review. You'll get access to the dashboard once approved."
      );
    }
  };

  const handleApplyAgain = () => {
    navigate("/affiliate-signup");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900">
              Loading your application status...
            </h3>
          </Card>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              No Application Found
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't submitted an affiliate application yet.
            </p>
            <Button onClick={() => navigate("/affiliate-signup")}>
              Apply to Become an Affiliate
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(user?.affiliateStatus || "pending");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Affiliate Application Status
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Track the progress of your affiliate application
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Status Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-full ${statusConfig.bgColor}`}>
                      <statusConfig.icon
                        className={`h-8 w-8 ${statusConfig.color}`}
                      />
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {statusConfig.title}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {statusConfig.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FiCalendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900">
                      Submitted On
                    </h3>
                    <p className="text-gray-600">
                      {application?.submittedDate || "Date not available"}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FiClock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900">
                      Estimated Review
                    </h3>
                    <p className="text-gray-600">
                      {application?.estimatedReviewTime || "24-48 hours"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {user?.affiliateStatus === "approved" ? (
                    <Button
                      onClick={handleGoToDashboard}
                      variant="primary"
                      className="flex-1"
                    >
                      Go to Affiliate Dashboard
                    </Button>
                  ) : user?.affiliateStatus === "rejected" ? (
                    <Button
                      onClick={handleApplyAgain}
                      variant="primary"
                      className="flex-1"
                    >
                      Apply Again
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate("/profile")}
                      variant="outline"
                      className="flex-1"
                    >
                      Back to Profile
                    </Button>
                  )}

                  <Button
                    onClick={() => navigate("/contact")}
                    variant="secondary"
                    className="flex-1"
                  >
                    <FiMail className="mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </Card>

            {/* Application Timeline */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Application Timeline
                </h3>
                <div className="space-y-4">
                  {statusConfig.timeline.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          item.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : item.status === "current"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {item.status === "completed" ? (
                          <FiCheck className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-semibold">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span
                            className={`font-medium ${
                              item.status === "completed" ||
                              item.status === "current"
                                ? "text-gray-900"
                                : "text-gray-500"
                            }`}
                          >
                            {item.step}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.date}
                          </span>
                        </div>
                        {index < statusConfig.timeline.length - 1 && (
                          <div
                            className={`ml-4 pl-4 border-l-2 ${
                              item.status === "completed"
                                ? "border-green-200"
                                : "border-gray-200"
                            } mt-2 mb-2 h-6`}
                          ></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiInfo className="mr-2 h-5 w-5 text-blue-600" />
                What to Expect
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Review typically takes 24-48 hours</p>
                <p>• You'll receive an email notification</p>
                <p>• Check back here for status updates</p>
                <p>• Contact support if you have questions</p>
              </div>
            </Card>

            {/* Next Steps */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Next Steps
              </h3>
              <div className="space-y-3 text-sm">
                {user?.affiliateStatus === "pending" && (
                  <>
                    <div className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Wait for review completion
                    </div>
                    <div className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                      Receive approval notification
                    </div>
                    <div className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                      Access affiliate dashboard
                    </div>
                  </>
                )}
                {user?.affiliateStatus === "approved" && (
                  <>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Access your dashboard
                    </div>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Get your referral link
                    </div>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Start earning commissions
                    </div>
                  </>
                )}
                {user?.affiliateStatus === "rejected" && (
                  <>
                    <div className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      Review feedback provided
                    </div>
                    <div className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      Consider reapplying
                    </div>
                    <div className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      Contact support for details
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Support Card */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Need Help?
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Email: affiliates@communiversity.com</p>
                <p>Response time: 1 business day</p>
                <Button
                  onClick={() => navigate("/contact")}
                  variant="outline"
                  className="w-full mt-3"
                >
                  <FiMail className="mr-2" />
                  Contact Support
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateStatus;