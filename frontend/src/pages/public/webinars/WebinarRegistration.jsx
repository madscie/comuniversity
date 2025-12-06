// components/Webinar/WebinarRegistration.jsx - FIXED
import { useState } from "react";
import { 
  FiUser, 
  FiMail, 
  FiCheckCircle, 
  FiCalendar, 
  FiClock,
  FiHome // Changed from FiBuilding
} from "react-icons/fi";
import Button from "../../../components/UI/Button";
import { webinarService } from "../../../services/webinarService";

const WebinarRegistration = ({ webinar, onClose, onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!formData.name.trim()) {
      setError("Please enter your name");
      setLoading(false);
      return;
    }
    
    if (!formData.email.trim()) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await webinarService.registerForWebinar(webinar.id, formData);
      
      if (response.success) {
        setSuccess(true);
        if (onRegistrationSuccess) {
          onRegistrationSuccess(response.data.attendees);
        }
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <FiCheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Registration Successful!
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          You are now registered for <strong className="text-green-600 dark:text-green-400">{webinar.title}</strong>
        </p>
        
        <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl mb-6">
          <div className="flex items-center justify-center space-x-2">
            <FiCalendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {formatDate(webinar.date)}
            </span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <FiClock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-800 dark:text-gray-200">
              Duration: {webinar.duration} minutes
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          A confirmation email has been sent to <strong>{formData.email}</strong>
        </p>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please add this event to your calendar. The join link will be sent 24 hours before the webinar.
          </p>
          {webinar.join_link && (
            <a
              href={webinar.join_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Add to Calendar
            </a>
          )}
        </div>
        
        <Button
          onClick={onClose}
          variant="outline"
          className="mt-6"
        >
          Close
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Register for Webinar
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Join <strong className="text-green-600 dark:text-green-400">{webinar.title}</strong>
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center">
            <FiUser className="mr-1" />
            <span>Hosted by {webinar.speaker}</span>
          </div>
          <div className="flex items-center">
            <FiClock className="mr-1" />
            <span>{webinar.duration} min</span>
          </div>
        </div>
        <div className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-2 rounded-lg mb-2">
          {webinar.current_attendees || 0} / {webinar.max_attendees} spots filled
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name *
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Company/Organization (Optional)
          </label>
          <div className="relative">
            <FiHome className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="ABC Corporation"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Registering...
              </div>
            ) : (
              "Register Now"
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="mb-1">By registering, you agree to:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Receive webinar reminders and follow-up emails</li>
          <li>Receive occasional updates about future webinars</li>
          <li>Your data being stored for webinar administration</li>
        </ul>
        <p className="mt-2">You can unsubscribe at any time.</p>
      </div>
    </div>
  );
};

export default WebinarRegistration;