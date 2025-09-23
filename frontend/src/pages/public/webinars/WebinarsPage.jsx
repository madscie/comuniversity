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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Webinars</h1>
            <p className="text-xl text-gray-700">Loading upcoming events...</p>
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
          {/* <h1 className="text-6xl font-bold text-gray-900 mb-4"></h1> */}
          <span className="text-transparent text-7xl font-bold bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Webinars Section
          </span>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Join our live educational sessions or watch recordings of past
            webinars to expand your knowledge.
          </p>
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
              Upcoming Webinars
            </button>
            <button
              className={`px-6 py-3 text-lg font-medium ${
                activeTab === "past"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("past")}
            >
              Past Webinars
            </button>
          </div>
        </div>

        {/* Webinars List */}
        <div className="grid gap-8">
          {(activeTab === "upcoming" ? upcomingWebinars : pastWebinars).map(
            (webinar) => (
              <Card
                key={webinar.id}
                className="p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <FiVideo className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {webinar.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{webinar.description}</p>

                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center text-gray-700">
                        <FiCalendar className="mr-2 text-blue-600" />
                        <span>{formatDate(webinar.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FiClock className="mr-2 text-blue-600" />
                        <span>{webinar.duration}</span>
                      </div>
                      <div className="text-gray-700">
                        <span className="font-medium">Speaker:</span>{" "}
                        {webinar.speaker}
                      </div>
                    </div>

                    {webinar.isUpcoming ? (
                      <Button
                        variant="gradient"
                        onClick={() => window.open(webinar.joinLink, "_blank")}
                        className="flex items-center"
                      >
                        <FiExternalLink className="mr-2" />
                        Join Webinar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() =>
                          window.open(webinar.recordingLink, "_blank")
                        }
                        className="flex items-center"
                      >
                        <FiVideo className="mr-2" />
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
