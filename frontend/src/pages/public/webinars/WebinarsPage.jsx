// src/pages/public/webinars/WebinarsPage.jsx
import { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiVideo, FiExternalLink } from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

const WebinarsPage = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Mock data for webinars
  const mockWebinars = [
    {
      id: 1,
      title: "Introduction to Digital Literacy",
      description:
        "Learn the fundamentals of digital literacy and how to navigate online resources effectively.",
      date: "2023-11-15T14:00:00",
      duration: "60 mins",
      speaker: "Dr. Sarah Johnson",
      isUpcoming: true,
      joinLink: "https://meet.google.com/abc-def-ghi",
      recordingLink: null,
    },
    {
      id: 2,
      title: "Advanced Research Techniques",
      description:
        "Discover advanced methods for academic research using digital library resources.",
      date: "2023-11-20T16:30:00",
      duration: "90 mins",
      speaker: "Prof. Michael Chen",
      isUpcoming: true,
      joinLink: "https://meet.google.com/jkl-mno-pqr",
      recordingLink: null,
    },
    {
      id: 3,
      title: "Children's Literature in the Digital Age",
      description:
        "Exploring how children's literature has evolved with digital technology.",
      date: "2023-10-10T10:00:00",
      duration: "45 mins",
      speaker: "Emily Rodriguez",
      isUpcoming: false,
      joinLink: null,
      recordingLink: "https://youtube.com/recording-123",
    },
    {
      id: 4,
      title: "Preserving Cultural Heritage Through Digital Archives",
      description:
        "How digital libraries are helping preserve cultural heritage for future generations.",
      date: "2023-09-05T11:30:00",
      duration: "75 mins",
      speaker: "Dr. James Williams",
      isUpcoming: false,
      joinLink: null,
      recordingLink: "https://youtube.com/recording-456",
    },
  ];

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setWebinars(mockWebinars);
      setLoading(false);
    }, 800);
  }, []);

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

  const upcomingWebinars = webinars.filter((webinar) => webinar.isUpcoming);
  const pastWebinars = webinars.filter((webinar) => !webinar.isUpcoming);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8 sm:py-12 px-3 sm:px-4 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Webinars
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
              Loading upcoming events...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:h-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-6 sm:py-8 lg:py-12 px-3 sm:px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Webinars Section
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl sm:max-w-3xl mx-auto px-2">
            Join our live educational sessions or watch recordings of past
            webinars to expand your knowledge.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6 sm:mb-8 lg:mb-10">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-medium ${
                activeTab === "upcoming"
                  ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming Webinars
            </button>
            <button
              className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-medium ${
                activeTab === "past"
                  ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("past")}
            >
              Past Webinars
            </button>
          </div>
        </div>

        {/* Webinars List */}
        <div className="grid gap-4 sm:gap-6 lg:gap-8">
          {(activeTab === "upcoming" ? upcomingWebinars : pastWebinars).map(
            (webinar) => (
              <Card
                key={webinar.id}
                className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 dark:shadow-gray-900/50"
              >
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-gray-100 to-green-100 dark:from-gray-700 dark:to-green-900/30 flex items-center justify-center">
                      <FiVideo className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                      {webinar.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
                      {webinar.description}
                    </p>

                    <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                      <div className="flex items-center text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                        <FiCalendar className="mr-1 sm:mr-2 text-green-600 dark:text-green-400 h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{formatDate(webinar.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                        <FiClock className="mr-1 sm:mr-2 text-green-600 dark:text-green-400 h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{webinar.duration}</span>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                        <span className="font-medium">Speaker:</span>{" "}
                        {webinar.speaker}
                      </div>
                    </div>

                    {webinar.isUpcoming ? (
                      <Button
                        variant="primary"
                        onClick={() => window.open(webinar.joinLink, "_blank")}
                        className="flex items-center text-xs sm:text-sm"
                      >
                        <FiExternalLink className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Join Webinar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() =>
                          window.open(webinar.recordingLink, "_blank")
                        }
                        className="flex items-center text-xs sm:text-sm"
                      >
                        <FiVideo className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Watch Recording
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          )}
        </div>

        {/* Empty State */}
        {activeTab === "upcoming" && upcomingWebinars.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="mx-auto bg-gradient-to-br from-gray-100 to-green-100 dark:from-gray-700 dark:to-green-900/30 p-4 sm:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center">
              <FiCalendar className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              No Upcoming Webinars
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
              Check back later for new webinar announcements.
            </p>
            <Button
              variant="primary"
              onClick={() => setActiveTab("past")}
              className="text-xs sm:text-sm"
            >
              View Past Webinars
            </Button>
          </div>
        )}

        {activeTab === "past" && pastWebinars.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="mx-auto bg-gradient-to-br from-gray-100 to-green-100 dark:from-gray-700 dark:to-green-900/30 p-4 sm:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center">
              <FiVideo className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              No Past Webinars
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Recordings of webinars will appear here after they conclude.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebinarsPage;
