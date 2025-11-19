import { useState, useEffect } from "react";
import {
  FiCalendar,
  FiClock,
  FiVideo,
  FiExternalLink,
  FiDollarSign,
  FiTag,
  FiUser,
  FiSearch,
  FiBookOpen,
  FiArrowRight,
} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import axios from "axios";
import { componentClasses } from "../../../components/UI/TailwindColors";

const WebinarsPage = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      setError(null);

      // ACTUAL API CALL - FIXED
      const response = await axios.get("http://localhost:5000/api/webinars");
      console.log("Webinars API response:", response.data);

      if (response.data.success) {
        setWebinars(response.data.data.webinars);
      } else {
        throw new Error(response.data.message || "Failed to fetch webinars");
      }
    } catch (err) {
      console.error("Error fetching webinars:", err);
      setError("Failed to load webinars. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWebinar = async (webinarId) => {
    try {
      const webinar = webinars.find((w) => w.id === webinarId);
      if (webinar && webinar.join_link) {
        window.open(webinar.join_link, "_blank");
      } else {
        setError("Join link not available for this webinar.");
      }
    } catch (err) {
      console.error("Error joining webinar:", err);
      setError("Failed to join webinar. Please try again.");
    }
  };

  const handleWatchRecording = async (webinarId) => {
    try {
      const webinar = webinars.find((w) => w.id === webinarId);
      if (webinar && webinar.recording_link) {
        window.open(webinar.recording_link, "_blank");
      } else {
        setError("Recording not available for this webinar.");
      }
    } catch (err) {
      console.error("Error accessing recording:", err);
      setError("Failed to access recording. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Determine if webinar is upcoming based on date
  const isWebinarUpcoming = (webinar) => {
    const webinarDate = new Date(webinar.date);
    const now = new Date();
    return webinarDate > now;
  };

  const upcomingWebinars = webinars.filter((webinar) =>
    isWebinarUpcoming(webinar)
  );
  const pastWebinars = webinars.filter(
    (webinar) => !isWebinarUpcoming(webinar)
  );

  // Loading spinner component matching homepage
  const LoadingSpinner = () => (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-16 h-16 border-4 border-green-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-green-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
          Loading Webinars...
        </p>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-green-100 dark:bg-green-900/20 rounded-full blur-2xl sm:blur-3xl opacity-30" />
          <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-gray-100 dark:bg-gray-800/30 rounded-full blur-2xl sm:blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Main Heading */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              Explore Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-green-600 dark:from-gray-300 dark:to-green-400 block sm:inline">
                Webinars
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl sm:max-w-4xl mx-auto leading-relaxed px-2">
              Join our live educational sessions or watch recordings of past
              webinars to expand your knowledge with industry experts.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-2xl mx-auto">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`py-3 sm:py-4 px-6 sm:px-8 text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 ${
                activeTab === "upcoming"
                  ? componentClasses.btn.primary
                  : componentClasses.btn.secondary
              }`}
            >
              <FiCalendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Upcoming Webinars
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`py-3 sm:py-4 px-6 sm:px-8 text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 ${
                activeTab === "past"
                  ? componentClasses.btn.primary
                  : componentClasses.btn.secondary
              }`}
            >
              <FiVideo className="h-4 w-4 sm:h-5 sm:w-5" />
              Past Recordings
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {webinars.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Total Webinars
              </div>
            </Card>
            <Card className="text-center p-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {upcomingWebinars.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Upcoming</div>
            </Card>
            <Card className="text-center p-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {pastWebinars.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Past Webinars
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-center">
              <p className="text-red-700 dark:text-red-400">{error}</p>
              <Button
                variant="primary"
                onClick={fetchWebinars}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex justify-center mb-10">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`px-6 py-3 text-lg font-medium ${
                  activeTab === "upcoming"
                    ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming Webinars ({upcomingWebinars.length})
              </button>
              <button
                className={`px-6 py-3 text-lg font-medium ${
                  activeTab === "past"
                    ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("past")}
              >
                Past Webinars ({pastWebinars.length})
              </button>
            </div>
          </div>

          {/* Webinars List */}
          <div className="grid gap-6">
            {(activeTab === "upcoming" ? upcomingWebinars : pastWebinars).map(
              (webinar) => (
                <Card
                  key={webinar.id}
                  className="p-6 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border-0 group"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Webinar Image or Icon */}
                    <div className="flex-shrink-0">
                      {webinar.image_url ? (
                        <img
                          src={`http://localhost:5000${webinar.image_url}`}
                          alt={webinar.title}
                          className="w-24 h-24 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                          <FiVideo className="h-10 w-10 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                          {webinar.title}
                        </h3>
                        {webinar.is_premium && (
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            PREMIUM
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {webinar.description}
                      </p>

                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <FiCalendar className="mr-2 text-green-600 dark:text-green-400" />
                          <span>{formatDate(webinar.date)}</span>
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <FiClock className="mr-2 text-green-600 dark:text-green-400" />
                          <span>{webinar.duration} minutes</span>
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <FiUser className="mr-2 text-green-600 dark:text-green-400" />
                          <span>{webinar.speaker}</span>
                        </div>
                        {webinar.price > 0 && (
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <FiDollarSign className="mr-2 text-green-600 dark:text-green-400" />
                            <span>${webinar.price}</span>
                          </div>
                        )}
                        {webinar.tags && webinar.tags.length > 0 && (
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <FiTag className="mr-2 text-purple-600 dark:text-purple-400" />
                            <span>{webinar.tags.join(", ")}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 items-center">
                        {isWebinarUpcoming(webinar) ? (
                          <>
                            <Button
                              variant="gradient"
                              onClick={() => handleJoinWebinar(webinar.id)}
                              className="flex items-center group/btn"
                            >
                              <FiExternalLink className="mr-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                              Join Webinar
                            </Button>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {webinar.current_attendees}/
                              {webinar.max_attendees} registered
                            </div>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => handleWatchRecording(webinar.id)}
                            className="flex items-center group/btn"
                          >
                            <FiVideo className="mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                            Watch Recording
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>

          {/* Empty State */}
          {activeTab === "upcoming" && upcomingWebinars.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl mb-6 w-24 h-24 flex items-center justify-center shadow-lg">
                <FiCalendar className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Upcoming Webinars
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Check back later for new webinar announcements.
              </p>
              <Button
                variant="primary"
                onClick={() => setActiveTab("past")}
                className="flex items-center gap-2 mx-auto"
              >
                View Past Webinars
                <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          )}

          {activeTab === "past" && pastWebinars.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl mb-6 w-24 h-24 flex items-center justify-center shadow-lg">
                <FiVideo className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Past Webinars
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Recordings of webinars will appear here after they conclude.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-3xl sm:max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Want to Host a Webinar?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Share your expertise with our community of learners and
            professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => navigate("/contact")}
              className={`px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-2 sm:gap-3 ${componentClasses.btn.success}`}
            >
              <FiVideo className="h-4 w-4 sm:h-5 sm:w-5" />
              Become a Speaker
            </button>
            <button
              onClick={() => navigate("/webinars")}
              className={`px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-bold rounded-lg sm:rounded-xl ${componentClasses.btn.outline} border-white text-white hover:bg-white hover:text-gray-900`}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WebinarsPage;
