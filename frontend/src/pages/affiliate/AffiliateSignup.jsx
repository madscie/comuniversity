// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FiDollarSign,
//   FiTrendingUp,
//   FiUsers,
//   FiCheck,
//   FiSend,
//   FiArrowRight,
// } from "react-icons/fi";
// import Card from "../../components/UI/Card";
// import Button from "../../components/UI/Button";
// import { useAuthStore } from "../../store/clerkAuthStore";

// const AffiliateSignup = () => {
//   const navigate = useNavigate();
//   const { user, updateAffiliateStatus } = useAuthStore();
//   const [formData, setFormData] = useState({
//     motivation: "",
//     promotionChannels: [],
//     agreeTerms: false,
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [programStats, setProgramStats] = useState(null);

//   const benefits = [
//     {
//       icon: FiDollarSign,
//       title: "Earn Commissions",
//       description: "Get paid for referring new members to our platform",
//     },
//     {
//       icon: FiTrendingUp,
//       title: "Real-time Tracking",
//       description: "Monitor your referrals and earnings in real-time",
//     },
//     {
//       icon: FiUsers,
//       title: "Grow Your Network",
//       description: "Build your audience while earning money",
//     },
//   ];

//   const promotionOptions = [
//     "Social Media",
//     "Blog/Website",
//     "Email List",
//     "YouTube",
//     "Podcast",
//     "Other",
//   ];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       // TODO: Replace with actual API call
//       // const response = await fetch('/api/affiliate/apply', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify(formData)
//       // });
      
//       // const result = await response.json();
      
//       // if (result.success) {
//       //   updateAffiliateStatus("pending", result.affiliateCode);
//       //   navigate("/profile");
//       // } else {
//       //   alert(result.error || "Failed to submit application");
//       // }

//       // Temporary simulation until backend is ready
//       setTimeout(() => {
//         // This will be replaced with actual affiliate code from backend
//         updateAffiliateStatus("pending", "PENDING_APPROVAL");
//         setIsSubmitting(false);
//         navigate("/profile");
//       }, 1000);
//     } catch (error) {
//       console.error("Error submitting affiliate application:", error);
//       alert("Failed to submit application. Please try again.");
//       setIsSubmitting(false);
//     }
//   };

//   const togglePromotionChannel = (channel) => {
//     setFormData((prev) => ({
//       ...prev,
//       promotionChannels: prev.promotionChannels.includes(channel)
//         ? prev.promotionChannels.filter((c) => c !== channel)
//         : [...prev.promotionChannels, channel],
//     }));
//   };

//   // If user is already an affiliate or pending, redirect
//   if (user?.affiliateStatus === "approved") {
//     navigate("/affiliate-dashboard");
//     return null;
//   }

//   if (user?.affiliateStatus === "pending") {
//     navigate("/profile");
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">
//             Join Our Affiliate Program
//           </h1>
//           <p className="text-lg text-gray-600 mt-2">
//             Earn commissions by referring new members to our platform
//           </p>
//         </div>

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Benefits Section */}
//           <div className="lg:col-span-2">
//             <Card className="mb-8">
//               <h2 className="text-xl font-semibold mb-4">Program Benefits</h2>
//               <div className="grid md:grid-cols-3 gap-6">
//                 {benefits.map((benefit, index) => (
//                   <div key={index} className="text-center">
//                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                       <benefit.icon className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <h3 className="font-semibold text-gray-900 mb-2">
//                       {benefit.title}
//                     </h3>
//                     <p className="text-sm text-gray-600">
//                       {benefit.description}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </Card>

//             {/* Commission Structure */}
//             <Card className="mb-8">
//               <h2 className="text-xl font-semibold mb-4">
//                 Commission Structure
//               </h2>
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div className="text-center p-4 border border-gray-200 rounded-lg">
//                   <FiUsers className="h-8 w-8 text-green-500 mx-auto mb-2" />
//                   <h3 className="font-semibold text-gray-900">Per Signup</h3>
//                   <p className="text-2xl font-bold text-green-600">
//                     Competitive Rate
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     For each successful referral
//                   </p>
//                 </div>
//                 <div className="text-center p-4 border border-gray-200 rounded-lg">
//                   <FiDollarSign className="h-8 w-8 text-purple-500 mx-auto mb-2" />
//                   <h3 className="font-semibold text-gray-900">
//                     Purchase Commission
//                   </h3>
//                   <p className="text-2xl font-bold text-purple-600">
//                     Generous Percentage
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Of referred user's purchases
//                   </p>
//                 </div>
//               </div>
//               <div className="mt-4 text-center">
//                 <p className="text-sm text-gray-600">
//                   Specific commission rates will be provided upon application approval
//                 </p>
//               </div>
//             </Card>

//             {/* Application Form */}
//             <Card>
//               <h2 className="text-xl font-semibold mb-4">Application Form</h2>
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Why do you want to join our affiliate program?
//                   </label>
//                   <textarea
//                     rows={4}
//                     value={formData.motivation}
//                     onChange={(e) =>
//                       setFormData({ ...formData, motivation: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Tell us about your audience and how you plan to promote our platform..."
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Where will you promote our platform? (Select all that apply)
//                   </label>
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                     {promotionOptions.map((channel) => (
//                       <label
//                         key={channel}
//                         className="flex items-center space-x-2"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={formData.promotionChannels.includes(channel)}
//                           onChange={() => togglePromotionChannel(channel)}
//                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                         />
//                         <span className="text-sm text-gray-700">{channel}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="agreeTerms"
//                     checked={formData.agreeTerms}
//                     onChange={(e) =>
//                       setFormData({ ...formData, agreeTerms: e.target.checked })
//                     }
//                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                     required
//                   />
//                   <label
//                     htmlFor="agreeTerms"
//                     className="ml-2 text-sm text-gray-700"
//                   >
//                     I agree to the{" "}
//                     <a
//                       href="/affiliate-terms"
//                       className="text-blue-600 hover:text-blue-700"
//                     >
//                       Affiliate Program Terms and Conditions
//                     </a>
//                   </label>
//                 </div>

//                 <Button
//                   type="submit"
//                   className="w-full"
//                   disabled={isSubmitting || !formData.agreeTerms}
//                 >
//                   {isSubmitting ? (
//                     "Submitting Application..."
//                   ) : (
//                     <>
//                       <FiSend className="mr-2" />
//                       Submit Application
//                     </>
//                   )}
//                 </Button>
//               </form>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Quick Stats */}
//             <Card>
//               <h3 className="text-lg font-semibold mb-4">Program Stats</h3>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Active Affiliates</span>
//                   <span className="font-semibold">
//                     {programStats?.activeAffiliates || "Loading..."}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Total Paid</span>
//                   <span className="font-semibold">
//                     {programStats?.totalPaid ? `$${programStats.totalPaid}` : "Loading..."}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Avg. Monthly</span>
//                   <span className="font-semibold">
//                     {programStats?.avgMonthly ? `$${programStats.avgMonthly}` : "Loading..."}
//                   </span>
//                 </div>
//               </div>
//               {!programStats && (
//                 <p className="text-xs text-gray-500 mt-2 text-center">
//                   Stats will load from our system
//                 </p>
//               )}
//             </Card>

//             {/* Requirements */}
//             <Card>
//               <h3 className="text-lg font-semibold mb-4">Requirements</h3>
//               <ul className="space-y-2 text-sm text-gray-600">
//                 <li className="flex items-center">
//                   <FiCheck className="h-4 w-4 text-green-500 mr-2" />
//                   Active platform member
//                 </li>
//                 <li className="flex items-center">
//                   <FiCheck className="h-4 w-4 text-green-500 mr-2" />
//                   No spam or unethical promotion
//                 </li>
//                 <li className="flex items-center">
//                   <FiCheck className="h-4 w-4 text-green-500 mr-2" />
//                   Follow our brand guidelines
//                 </li>
//                 <li className="flex items-center">
//                   <FiCheck className="h-4 w-4 text-green-500 mr-2" />
//                   Maintain positive account standing
//                 </li>
//               </ul>
//             </Card>

//             {/* Next Steps */}
//             <Card>
//               <h3 className="text-lg font-semibold mb-4">What Happens Next?</h3>
//               <div className="space-y-3 text-sm">
//                 <div className="flex items-center">
//                   <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
//                     <span className="text-xs font-semibold text-blue-600">
//                       1
//                     </span>
//                   </div>
//                   <span>Submit your application</span>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
//                     <span className="text-xs font-semibold text-yellow-600">
//                       2
//                     </span>
//                   </div>
//                   <span>We review within 48 hours</span>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
//                     <span className="text-xs font-semibold text-green-600">
//                       3
//                     </span>
//                   </div>
//                   <span>Get your affiliate dashboard</span>
//                 </div>
//               </div>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AffiliateSignup;






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