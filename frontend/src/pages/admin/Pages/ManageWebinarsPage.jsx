import { useState, useEffect } from "react";
import {
  FiVideo,
  FiCalendar,
  FiClock,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiUsers,
  FiExternalLink,
} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

const ManageWebinarsPage = () => {
  const [webinars, setWebinars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);

  useEffect(() => {
    loadWebinars();
  }, []);

  const loadWebinars = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/webinars');
      // const data = await response.json();
      // setWebinars(data);
      
      // Temporary empty state until backend is ready
      setWebinars([]);
    } catch (error) {
      console.error("Error loading webinars:", error);
      // Empty state on error
      setWebinars([]);
    } finally {
      setLoading(false);
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

  const filteredWebinars = webinars.filter(
    (webinar) =>
      webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webinar.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteWebinar = async (id) => {
    if (window.confirm("Are you sure you want to delete this webinar?")) {
      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/admin/webinars/${id}`, {
        //   method: 'DELETE'
        // });
        
        // Update local state temporarily
        setWebinars(webinars.filter((webinar) => webinar.id !== id));
      } catch (error) {
        console.error("Error deleting webinar:", error);
        alert("Failed to delete webinar. Please try again.");
      }
    }
  };

  const handleEditWebinar = (webinar) => {
    setEditingWebinar(webinar);
    setShowModal(true);
  };

  const handleAddWebinar = () => {
    setEditingWebinar(null);
    setShowModal(true);
  };

  const handleSaveWebinar = async (webinarData) => {
    try {
      if (editingWebinar) {
        // Update existing webinar
        // await fetch(`/api/admin/webinars/${editingWebinar.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(webinarData)
        // });
        
        // Update local state temporarily
        setWebinars(
          webinars.map((w) =>
            w.id === editingWebinar.id ? { ...w, ...webinarData } : w
          )
        );
      } else {
        // Add new webinar
        // const response = await fetch('/api/admin/webinars', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(webinarData)
        // });
        // const newWebinar = await response.json();
        
        // Update local state temporarily
        const newWebinar = {
          id: Math.max(...webinars.map((w) => w.id), 0) + 1,
          ...webinarData,
          currentAttendees: 0,
          isUpcoming: true,
          status: "scheduled",
        };
        setWebinars([...webinars, newWebinar]);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving webinar:", error);
      alert("Failed to save webinar. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Webinars</h1>
          <p className="text-gray-600">
            Create and manage educational webinars
          </p>
        </div>
        <Button onClick={handleAddWebinar}>
          <FiPlus className="mr-2" />
          Add Webinar
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search webinars by title or speaker..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Webinars Grid */}
      <div className="grid gap-6">
        {filteredWebinars.length === 0 ? (
          <Card className="text-center py-12">
            <div className="mx-auto bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl mb-6 w-24 h-24 flex items-center justify-center">
              <FiVideo className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Webinars Found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by creating your first webinar"}
            </p>
            <Button onClick={handleAddWebinar}>
              <FiPlus className="mr-2" />
              Add Webinar
            </Button>
          </Card>
        ) : (
          filteredWebinars.map((webinar) => (
            <Card
              key={webinar.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <FiVideo className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {webinar.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        webinar.status === "scheduled"
                          ? "bg-green-100 text-green-800"
                          : webinar.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {webinar.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{webinar.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-700">
                      <FiCalendar className="mr-2 text-blue-600" />
                      <span>{formatDate(webinar.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FiClock className="mr-2 text-blue-600" />
                      <span>{webinar.duration}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FiUsers className="mr-2 text-blue-600" />
                      <span>
                        {webinar.currentAttendees || 0}/{webinar.maxAttendees}{" "}
                        attendees
                      </span>
                    </div>
                  </div>

                  <div className="text-gray-700 mb-4">
                    <span className="font-medium">Speaker:</span>{" "}
                    {webinar.speaker}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {webinar.isUpcoming ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(webinar.joinLink, "_blank")}
                      >
                        <FiExternalLink className="mr-1" />
                        Join Link
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(webinar.recordingLink, "_blank")
                        }
                      >
                        <FiVideo className="mr-1" />
                        Recording
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleEditWebinar(webinar)}
                    >
                      <FiEdit className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteWebinar(webinar.id)}
                    >
                      <FiTrash2 className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Webinar Modal */}
      {showModal && (
        <WebinarModal
          webinar={editingWebinar}
          onSave={handleSaveWebinar}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

// Webinar Modal Component
const WebinarModal = ({ webinar, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: webinar?.title || "",
    description: webinar?.description || "",
    date: webinar?.date ? webinar.date.split("T")[0] : "",
    time: webinar?.date ? webinar.date.split("T")[1].substring(0, 5) : "14:00",
    duration: webinar?.duration || "60 mins",
    speaker: webinar?.speaker || "",
    maxAttendees: webinar?.maxAttendees || 50,
    joinLink: webinar?.joinLink || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      await onSave({
        ...formData,
        date: dateTime.toISOString(),
      });
    } catch (error) {
      console.error("Error submitting webinar form:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {webinar ? "Edit Webinar" : "Add New Webinar"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Attendees
                </label>
                <input
                  type="number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.maxAttendees}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxAttendees: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speaker
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.speaker}
                onChange={(e) =>
                  setFormData({ ...formData, speaker: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Join Link
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.joinLink}
                onChange={(e) =>
                  setFormData({ ...formData, joinLink: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {webinar ? "Update" : "Create"} Webinar
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ManageWebinarsPage;