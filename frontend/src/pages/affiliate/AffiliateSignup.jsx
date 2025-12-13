import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiCheck,
  FiSend,
  FiArrowRight,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { useUser, useAuth } from "@clerk/clerk-react";

const AffiliateSignup = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const [formData, setFormData] = useState({
    motivation: "",
    promotionChannels: [],
    agreeTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get affiliate status from Clerk metadata
  const affiliateStatus = user?.publicMetadata?.affiliateStatus || 'not_applied';
  const isAffiliate = user?.publicMetadata?.isAffiliate || false;

  const benefits = [
    {
      icon: FiDollarSign,
      title: "Earn Commissions",
      description: "Get paid for referring new members to our platform",
    },
    {
      icon: FiTrendingUp,
      title: "Real-time Tracking",
      description: "Monitor your referrals and earnings in real-time",
    },
    {
      icon: FiUsers,
      title: "Grow Your Network",
      description: "Build your audience while earning money",
    },
  ];

  const promotionOptions = [
    "Social Media",
    "Blog/Website",
    "Email List",
    "YouTube",
    "Podcast",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      navigate("/login?redirect=/affiliate-signup");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit affiliate application
      const response = await fetch('/api/affiliate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          motivation: formData.motivation,
          promotionChannels: formData.promotionChannels,
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // The user's affiliate status will be updated in Clerk via webhook
        // or you can update it directly if you have the Clerk instance
        navigate("/affiliate-status");
      } else {
        alert(result.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting affiliate application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePromotionChannel = (channel) => {
    setFormData((prev) => ({
      ...prev,
      promotionChannels: prev.promotionChannels.includes(channel)
        ? prev.promotionChannels.filter((c) => c !== channel)
        : [...prev.promotionChannels, channel],
    }));
  };

  // Redirect if not signed in
  if (!isSignedIn) {
    navigate("/login?redirect=/affiliate-signup");
    return null;
  }

  // If user is already an affiliate or pending, redirect
  if (isAffiliate || affiliateStatus === "approved") {
    navigate("/affiliate-dashboard");
    return null;
  }

  if (affiliateStatus === "pending") {
    navigate("/affiliate-status");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Join Our Affiliate Program
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Earn commissions by referring new members to our platform
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Benefits Section */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Program Benefits</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <benefit.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Rest of your component remains the same */}
            {/* ... (commission structure and application form) */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info Card */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Your Account</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">Eligible</span>
                </div>
              </div>
            </Card>

            {/* Requirements */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                  Active platform member
                </li>
                <li className="flex items-center">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                  No spam or unethical promotion
                </li>
                <li className="flex items-center">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                  Follow our brand guidelines
                </li>
                <li className="flex items-center">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                  Maintain positive account standing
                </li>
              </ul>
            </Card>

            {/* Next Steps */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">What Happens Next?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-blue-600">
                      1
                    </span>
                  </div>
                  <span>Submit your application</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-yellow-600">
                      2
                    </span>
                  </div>
                  <span>We review within 48 hours</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-green-600">
                      3
                    </span>
                  </div>
                  <span>Get your affiliate dashboard</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateSignup;