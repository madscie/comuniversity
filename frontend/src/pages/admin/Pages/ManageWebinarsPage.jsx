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
  FiImage,
  FiUpload,
  FiX,
  FiDollarSign,
  FiTag,
} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import { webinarService } from "../../../services/webinarService"; // UPDATED IMPORT

const ManageWebinarsPage = () => {
  const [webinars, setWebinars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    loadWebinars();
  }, []);

  const loadWebinars = async () => {
    setLoading(true);
    try {
      const response = await webinarService.getWebinars(); // UPDATED
      if (response.success) {
        setWebinars(response.data.webinars || []);
      } else {
        console.error("Failed to load webinars:", response.message);
        setWebinars([]);
      }
    } catch (error) {
      console.error("Error loading webinars:", error);
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

  const getWebinarStatus = (webinar) => {
    const now = new Date();
    const webinarDate = new Date(webinar.date);
    if (webinar.status === "cancelled") return "cancelled";
    if (webinar.status === "completed") return "completed";
    if (webinarDate < now) return "completed";
    if (webinarDate > now) return "scheduled";
    return "live";
  };

  const filteredWebinars = webinars.filter(
    (webinar) =>
      webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webinar.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webinar.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteWebinar = async (id) => {
    if (window.confirm("Are you sure you want to delete this webinar?")) {
      try {
        const response = await webinarService.deleteWebinar(id); // UPDATED
        if (response.success) {
          setWebinars(webinars.filter((webinar) => webinar.id !== id));
        } else {
          throw new Error(response.message);
        }
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
    setSaveLoading(true);
    try {
      let response;
      if (editingWebinar) {
        response = await webinarService.updateWebinar(
          editingWebinar.id,
          webinarData
        ); // UPDATED
      } else {
        response = await webinarService.createWebinar(webinarData); // UPDATED
      }
      if (response.success) {
        await loadWebinars();
        setShowModal(false);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error saving webinar:", error);
      alert("Failed to save webinar. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      const response = await webinarService.updateWebinar(id, {
        status: newStatus,
      }); // UPDATED
      if (response.success) {
        setWebinars(
          webinars.map((webinar) =>
            webinar.id === id ? { ...webinar, status: newStatus } : webinar
          )
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error updating webinar status:", error);
      alert("Failed to update webinar status. Please try again.");
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
            {" "}
            Create and manage educational webinars{" "}
          </p>
        </div>
        <Button onClick={handleAddWebinar}>
          <FiPlus className="mr-2" /> Add Webinar
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 text-center">
          <FiVideo className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {webinars.length}
          </div>
          <div className="text-sm text-gray-600">Total Webinars</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {webinars.filter((w) => getWebinarStatus(w) === "scheduled").length}
          </div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {webinars.filter((w) => getWebinarStatus(w) === "completed").length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </Card>
        <Card className="p-6 text-center">
          <FiUsers className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {webinars.reduce((sum, w) => sum + (w.current_attendees || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Attendees</div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search webinars by title, speaker, or description..."
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
              {webinars.length === 0
                ? "No Webinars Found"
                : "No Matching Webinars"}
            </h3>
            <p className="text-gray-600 mb-6">
              {webinars.length === 0
                ? "Get started by creating your first webinar"
                : "Try adjusting your search terms"}
            </p>
            {webinars.length === 0 && (
              <Button onClick={handleAddWebinar}>
                <FiPlus className="mr-2" /> Add Webinar
              </Button>
            )}
          </Card>
        ) : (
          filteredWebinars.map((webinar) => {
            const status = getWebinarStatus(webinar);
            const isUpcoming = status === "scheduled";
            return (
              <Card
                key={webinar.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                      {webinar.image_url ? (
                        <img
                          src={webinar.image_url}
                          alt={webinar.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiVideo className="h-8 w-8 text-blue-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {webinar.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            status === "scheduled"
                              ? "bg-green-100 text-green-800"
                              : status === "completed"
                              ? "bg-gray-100 text-gray-800"
                              : status === "live"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {status}
                        </span>
                        {webinar.is_premium && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {webinar.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-gray-700">
                        <FiCalendar className="mr-2 text-blue-600" />
                        <span>{formatDate(webinar.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FiClock className="mr-2 text-blue-600" />
                        <span>{webinar.duration} mins</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FiUsers className="mr-2 text-blue-600" />
                        <span>
                          {webinar.current_attendees || 0}/
                          {webinar.max_attendees} attendees
                        </span>
                      </div>
                      {webinar.price > 0 && (
                        <div className="flex items-center text-gray-700">
                          <FiDollarSign className="mr-2 text-green-600" />
                          <span>${parseFloat(webinar.price).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-700 mb-4">
                      <span className="font-medium">Speaker:</span>{" "}
                      {webinar.speaker}
                      {webinar.speaker_bio && (
                        <span className="text-sm text-gray-600 ml-2">
                          - {webinar.speaker_bio}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {isUpcoming && webinar.join_link ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(webinar.join_link, "_blank")
                          }
                        >
                          <FiExternalLink className="mr-1" /> Join Link
                        </Button>
                      ) : webinar.recording_link ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(webinar.recording_link, "_blank")
                          }
                        >
                          <FiVideo className="mr-1" /> Recording
                        </Button>
                      ) : null}
                      {isUpcoming && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleToggleStatus(webinar.id, "completed")
                          }
                        >
                          Mark Complete
                        </Button>
                      )}
                      {status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleToggleStatus(webinar.id, "scheduled")
                          }
                        >
                          Reschedule
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleEditWebinar(webinar)}
                      >
                        <FiEdit className="mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteWebinar(webinar.id)}
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Webinar Modal */}
      {showModal && (
        <WebinarModal
          webinar={editingWebinar}
          onSave={handleSaveWebinar}
          onClose={() => setShowModal(false)}
          isLoading={saveLoading}
        />
      )}
    </div>
  );
};

// Webinar Modal Component
const WebinarModal = ({ webinar, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    title: webinar?.title || "",
    description: webinar?.description || "",
    date: webinar?.date ? webinar.date.split("T")[0] : "",
    time: webinar?.date ? webinar.date.split("T")[1].substring(0, 5) : "14:00",
    duration: webinar?.duration || 60,
    speaker: webinar?.speaker || "",
    speaker_bio: webinar?.speaker_bio || "",
    max_attendees: webinar?.max_attendees || 50,
    join_link: webinar?.join_link || "",
    recording_link: webinar?.recording_link || "",
    price: webinar?.price || 0,
    is_premium: webinar?.is_premium || false,
    category: webinar?.category || "Education",
    tags: webinar?.tags ? webinar.tags.join(", ") : "",
    status: webinar?.status || "scheduled",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(webinar?.image_url || "");
  const [errors, setErrors] = useState({});

  const categories = [
    "Technology",
    "Education",
    "Science",
    "Health",
    "Business",
    "Arts",
    "Literature",
    "History",
    "Travel",
    "Lifestyle",
    "Other",
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file (JPEG, PNG, GIF, WebP)",
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }
      setImageFile(file);
      setErrors((prev) => ({ ...prev, image: "" }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (!formData.time) {
      newErrors.time = "Time is required";
    }
    if (!formData.duration || formData.duration < 1) {
      newErrors.duration = "Duration must be at least 1 minute";
    }
    if (!formData.speaker.trim()) {
      newErrors.speaker = "Speaker is required";
    }
    if (!formData.max_attendees || formData.max_attendees < 1) {
      newErrors.max_attendees = "Maximum attendees must be at least 1";
    }
    if (formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const submissionData = {
        ...formData,
        date: dateTime.toISOString(),
        duration: parseInt(formData.duration),
        max_attendees: parseInt(formData.max_attendees),
        price: parseFloat(formData.price),
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag !== "")
          : [],
      };
      if (imageFile) {
        submissionData.imageFile = imageFile;
      }
      await onSave(submissionData);
    } catch (error) {
      console.error("Error submitting webinar form:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to save webinar. Please try again.",
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {webinar ? "Edit Webinar" : "Add New Webinar"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Webinar Image
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white">
                  {imagePreview ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={imagePreview}
                        alt="Webinar preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeImage}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-300"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FiImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No image</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <FiUpload className="mr-2 h-4 w-4" /> Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-600 mt-2">
                    Supports: JPEG, PNG, GIF, WebP
                    <br />
                    Max size: 5MB
                  </p>
                </div>
              </div>
              {errors.image && (
                <p className="text-red-500 text-sm mt-2">{errors.image}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.title}
                  onChange={handleInputChange}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.description}
                  onChange={handleInputChange}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Date and Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.date}
                  onChange={handleInputChange}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.time ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.time}
                  onChange={handleInputChange}
                />
                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                )}
              </div>

              {/* Duration and Max Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  required
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.duration ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.duration}
                  onChange={handleInputChange}
                />
                {errors.duration && (
                  <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Attendees *
                </label>
                <input
                  type="number"
                  name="max_attendees"
                  required
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.max_attendees ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.max_attendees}
                  onChange={handleInputChange}
                />
                {errors.max_attendees && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.max_attendees}
                  </p>
                )}
              </div>

              {/* Speaker and Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker *
                </label>
                <input
                  type="text"
                  name="speaker"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.speaker ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.speaker}
                  onChange={handleInputChange}
                />
                {errors.speaker && (
                  <p className="text-red-500 text-sm mt-1">{errors.speaker}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speaker Bio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker Bio
                </label>
                <textarea
                  name="speaker_bio"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.speaker_bio}
                  onChange={handleInputChange}
                  placeholder="Brief introduction about the speaker..."
                />
              </div>

              {/* Price and Premium */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.price}
                  onChange={handleInputChange}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_premium"
                  id="is_premium"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.is_premium}
                  onChange={handleInputChange}
                />
                <label
                  htmlFor="is_premium"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Premium Webinar
                </label>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Separate tags with commas"
                />
              </div>

              {/* Links */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Join Link
                </label>
                <input
                  type="url"
                  name="join_link"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.join_link}
                  onChange={handleInputChange}
                  placeholder="https://meet.google.com/..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recording Link
                </label>
                <input
                  type="url"
                  name="recording_link"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.recording_link}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {webinar ? "Updating..." : "Creating..."}
                  </div>
                ) : webinar ? (
                  "Update Webinar"
                ) : (
                  "Create Webinar"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageWebinarsPage;
