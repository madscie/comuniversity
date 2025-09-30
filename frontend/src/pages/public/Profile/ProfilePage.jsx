import { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { FiUser, FiMail, FiCalendar, FiBook } from "react-icons/fi";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "Book enthusiast and lifelong learner",
    joinDate: "January 2024",
  });

  const stats = [
    { label: "Books Read", value: "24", icon: FiBook },
    { label: "Currently Reading", value: "3", icon: FiBook },
    { label: "Want to Read", value: "12", icon: FiBook },
  ];

  const handleSave = () => {
    // Add your update profile logic here
    console.log("Saving profile:", formData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your account and reading preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h2>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-6 mb-6">
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                    <FiUser className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {user?.name}
                    </h3>
                    <p className="text-gray-600 flex items-center">
                      <FiMail className="h-4 w-4 mr-2" />
                      {user?.email}
                    </p>
                    <p className="text-gray-500 text-sm flex items-center">
                      <FiCalendar className="h-4 w-4 mr-2" />
                      Member since {formData.joinDate}
                    </p>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 mb-4">{formData.bio}</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Reading Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reading Stats
              </h3>
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <stat.icon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to="/my-books"
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                >
                  My Reading List
                </Link>
                <Link
                  to="/settings"
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                >
                  Account Settings
                </Link>
                <Link
                  to="/browse"
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse Books
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
