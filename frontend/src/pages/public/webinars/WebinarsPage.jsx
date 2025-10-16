import { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiVideo, FiExternalLink } from "react-icons/fi";
import { FaYoutube, FaVideo } from "react-icons/fa";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

const WebinarsPage = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/webinars");
        const data = await response.json();
        setWebinars(data);
      } catch (error) {
        console.error("Error fetching webinars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWebinars();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const upcomingWebinars = webinars.filter(w => w.isUpcoming);
  const pastWebinars = webinars.filter(w => !w.isUpcoming);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Webinars</h1>
          <p className="text-xl text-gray-700">Join our live sessions or watch past recordings.</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-3 text-lg font-medium ${activeTab === "upcoming" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming Webinars
            </button>
            <button
              className={`px-6 py-3 text-lg font-medium ${activeTab === "past" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("past")}
            >
              Past Webinars
            </button>
          </div>
        </div>

        <div className="grid gap-8">
          {(activeTab === "upcoming" ? upcomingWebinars : pastWebinars).map(webinar => {
            const isZoom = webinar.joinLink?.includes("zoom.us");
            const isYoutube = webinar.recordingLink?.includes("youtube.com");

            return (
              <Card key={webinar.id} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <FiVideo className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{webinar.title}</h3>
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
                        <span className="font-medium">Speaker:</span> {webinar.speaker}
                      </div>
                    </div>

                    {webinar.isUpcoming ? (
                      <Button
                        variant="gradient"
                        onClick={() => webinar.joinLink && window.open(webinar.joinLink, "_blank")}
                        className="flex items-center"
                        disabled={!webinar.joinLink}
                      >
                        {isZoom ? <FaVideo className="mr-2" /> : <FiExternalLink className="mr-2" />}
                        Join Webinar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => webinar.recordingLink && window.open(webinar.recordingLink, "_blank")}
                        className="flex items-center"
                        disabled={!webinar.recordingLink}
                      >
                        {isYoutube ? <FaYoutube className="mr-2" /> : <FiVideo className="mr-2" />}
                        Watch Recording
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WebinarsPage;
