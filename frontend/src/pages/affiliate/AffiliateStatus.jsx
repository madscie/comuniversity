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
import { useUser, useAuth } from "@clerk/clerk-react";

const AffiliateStatus = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get affiliate status from Clerk metadata
  const affiliateStatus = user?.publicMetadata?.affiliateStatus || 'not_applied';
  const isAffiliate = user?.publicMetadata?.isAffiliate || false;

  useEffect(() => {
    if (isSignedIn) {
      loadApplicationData();
    }
  }, [isSignedIn, user]);

  const loadApplicationData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/affiliate/application/${user?.id}`);
      // const applicationData = await response.json();
      // setApplication(applicationData);

      // Temporary data structure
      if (affiliateStatus !== 'not_applied') {
        setApplication({
          status: affiliateStatus,
          submittedDate: new Date().toISOString().split('T')[0],
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

  // Rest of your component remains largely the same, just update the status checks
  // to use affiliateStatus and isAffiliate from Clerk metadata

  // ... (getStatusConfig function remains the same)

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
    if (isAffiliate) {
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

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Card className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Sign In Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to view your application status.
            </p>
            <Button onClick={() => navigate("/login")}>
              Sign In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // ... rest of your component remains the same, just update the status checks
  // to use affiliateStatus instead of user.affiliateStatus

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

  if (!application && affiliateStatus === 'not_applied') {
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

  const statusConfig = getStatusConfig(affiliateStatus);

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

        {/* Rest of your component remains the same */}
        {/* ... */}
      </div>
    </div>
  );
};

export default AffiliateStatus;