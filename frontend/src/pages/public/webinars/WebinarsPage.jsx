import { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiVideo, FiExternalLink, FiDollarSign, FiTag, FiUser} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import axios from "axios";

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
      const response = await axios.get('http://localhost:5000/api/webinars');
      console.log("Webinars API response:", response.data);
      
      if (response.data.success) {
        setWebinars(response.data.data.webinars);
      } else {
        throw new Error(response.data.message || 'Failed to fetch webinars');
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
      // TODO: Replace with actual API call for join link
      // For now, just open the join link if available
      const webinar = webinars.find(w => w.id === webinarId);
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
      // TODO: Replace with actual API call for recording
      // For now, just open the recording link if available
      const webinar = webinars.find(w => w.id === webinarId);
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

  const upcomingWebinars = webinars.filter((webinar) => isWebinarUpcoming(webinar));
  const pastWebinars = webinars.filter((webinar) => !isWebinarUpcoming(webinar));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-transparent text-7xl font-bold bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Webinars Section
            </span>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Join our live educational sessions or watch recordings of past
              webinars to expand your knowledge.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-transparent text-7xl font-bold bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Webinars Section
          </span>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Join our live educational sessions or watch recordings of past
            webinars to expand your knowledge.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-red-700">{error}</p>
            <Button 
              variant="primary" 
              onClick={fetchWebinars}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="text-center p-6 bg-white/80 backdrop-blur-sm">
            <div className="text-3xl font-bold text-blue-600">{webinars.length}</div>
            <div className="text-gray-600">Total Webinars</div>
          </Card>
          <Card className="text-center p-6 bg-white/80 backdrop-blur-sm">
            <div className="text-3xl font-bold text-green-600">{upcomingWebinars.length}</div>
            <div className="text-gray-600">Upcoming</div>
          </Card>
          <Card className="text-center p-6 bg-white/80 backdrop-blur-sm">
            <div className="text-3xl font-bold text-purple-600">{pastWebinars.length}</div>
            <div className="text-gray-600">Past Webinars</div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-10">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-3 text-lg font-medium ${
                activeTab === "upcoming"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming Webinars ({upcomingWebinars.length})
            </button>
            <button
              className={`px-6 py-3 text-lg font-medium ${
                activeTab === "past"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("past")}
            >
              Past Webinars ({pastWebinars.length})
            </button>
          </div>
        </div>

        {/* Webinars List */}
        <div className="grid gap-8">
          {(activeTab === "upcoming" ? upcomingWebinars : pastWebinars).map(
            (webinar) => (
              <Card
                key={webinar.id}
                className="p-6 hover:shadow-lg transition-shadow duration-300 bg-white/90 backdrop-blur-sm"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Webinar Image or Icon */}
                  <div className="flex-shrink-0">
                    {webinar.image_url ? (
                      <img 
                        src={`http://localhost:5000${webinar.image_url}`} 
                        alt={webinar.title}
                        className="w-24 h-24 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <FiVideo className="h-10 w-10 text-blue-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {webinar.title}
                      </h3>
                      {webinar.is_premium && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          PREMIUM
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{webinar.description}</p>

                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center text-gray-700">
                        <FiCalendar className="mr-2 text-blue-600" />
                        <span>{formatDate(webinar.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FiClock className="mr-2 text-blue-600" />
                        <span>{webinar.duration} minutes</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FiUser className="mr-2 text-blue-600" />
                        <span>{webinar.speaker}</span>
                      </div>
                      {webinar.price > 0 && (
                        <div className="flex items-center text-gray-700">
                          <FiDollarSign className="mr-2 text-green-600" />
                          <span>${webinar.price}</span>
                        </div>
                      )}
                      {webinar.tags && webinar.tags.length > 0 && (
                        <div className="flex items-center text-gray-700">
                          <FiTag className="mr-2 text-purple-600" />
                          <span>{webinar.tags.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {isWebinarUpcoming(webinar) ? (
                        <>
                          <Button
                            variant="gradient"
                            onClick={() => handleJoinWebinar(webinar.id)}
                            className="flex items-center"
                          >
                            <FiExternalLink className="mr-2" />
                            Join Webinar
                          </Button>
                          <div className="text-sm text-gray-600">
                            {webinar.current_attendees}/{webinar.max_attendees} registered
                          </div>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => handleWatchRecording(webinar.id)}
                          className="flex items-center"
                        >
                          <FiVideo className="mr-2" />
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
            <div className="mx-auto bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl mb-6 w-24 h-24 flex items-center justify-center">
              <FiCalendar className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Upcoming Webinars
            </h3>
            <p className="text-gray-600 mb-6">
              Check back later for new webinar announcements.
            </p>
            <Button variant="primary" onClick={() => setActiveTab("past")}>
              View Past Webinars
            </Button>
          </div>
        )}

        {activeTab === "past" && pastWebinars.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl mb-6 w-24 h-24 flex items-center justify-center">
              <FiVideo className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Past Webinars
            </h3>
            <p className="text-gray-600">
              Recordings of webinars will appear here after they conclude.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebinarsPage;