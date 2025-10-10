import React, { useState, useEffect } from 'react';
import { useAuthStore } from "../../store/authStore";
import UserProfile from '../../components/UserProfile/UserProfile';

import {
  FiUser,
  FiMail,
  FiCalendar,
  FiBook,
  FiAward,
  FiSettings,
  FiEdit,
  FiSave,
  FiX,
  FiUpload,
  FiBarChart2,
  FiStar,
  FiClock,
  FiHeart,
  FiTrendingUp,
  FiShield,
  FiBell
} from 'react-icons/fi';

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    phone: '',
    location: ''
  });

  // Mock user data - replace with actual API calls
  const userStats = {
    memberSince: 'Jan 2024',
    totalBooksRead: 24,
    readingStreak: 15,
    favoriteGenre: 'Science Fiction',
    achievementPoints: 1250,
    readingLevel: 'Book Worm',
    readingGoal: 75
  };

  const achievements = [
    { id: 1, name: 'First Read', earned: true, icon: '📖', description: 'Read your first book' },
    { id: 2, name: 'Week Warrior', earned: true, icon: '⚡', description: 'Read for 7 days straight' },
    { id: 3, name: 'Genre Explorer', earned: false, icon: '🧭', description: 'Read 5 different genres' },
    { id: 4, name: 'Speed Reader', earned: true, icon: '🚀', description: 'Read 3 books in a month' },
    { id: 5, name: 'Library Legend', earned: false, icon: '🏆', description: 'Read 50+ books' }
  ];

  const readingHistory = [
    { id: 1, title: 'Dune', author: 'Frank Herbert', date: '2 days ago', rating: 5 },
    { id: 2, title: 'Project Hail Mary', author: 'Andy Weir', date: '1 week ago', rating: 4 },
    { id: 3, title: 'The Three-Body Problem', author: 'Liu Cixin', date: '2 weeks ago', rating: 5 },
    { id: 4, title: '1984', author: 'George Orwell', date: '3 weeks ago', rating: 4 }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: 'Avid reader and lifelong learner. Love science fiction and historical non-fiction.',
        phone: '+1 (555) 123-4567',
        location: 'New York, USA'
      });
    }
  }, [user]);

  const handleSave = async () => {
    // Here you would call your API to update the user profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
    // Update the user in the store
    updateUserProfile({ ...user, ...formData });
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: 'Avid reader and lifelong learner. Love science fiction and historical non-fiction.',
      phone: '+1 (555) 123-4567',
      location: 'New York, USA'
    });
    setIsEditing(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a temporary URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      updateUserProfile({ ...user, profilePicture: imageUrl });
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'achievements', name: 'Achievements', icon: FiAward },
    { id: 'reading', name: 'Reading Stats', icon: FiBarChart2 },
    { id: 'privacy', name: 'Privacy', icon: FiShield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <div className="relative">
                <UserProfile user={user} size="xxlarge" />
                <label htmlFor="profile-picture" className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg">
                  <FiUpload className="h-4 w-4" />
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-gray-600 mt-1">{user?.email}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <FiAward className="w-4 h-4 mr-1" />
                    {userStats.readingLevel}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <FiStar className="w-4 h-4 mr-1" />
                    {userStats.achievementPoints} pts
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
                >
                  <FiEdit className="h-5 w-5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg"
                  >
                    <FiSave className="h-5 w-5" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    <FiX className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{user?.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{user?.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <FiMail className="h-5 w-5 text-gray-400" />
                        <p className="text-gray-900">{user?.email}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Reading Stats & Preferences */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reading Overview</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <FiBook className="h-8 w-8 text-blue-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{userStats.totalBooksRead}</p>
                      <p className="text-sm text-gray-600">Books Read</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <FiClock className="h-8 w-8 text-green-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{userStats.readingStreak}</p>
                      <p className="text-sm text-gray-600">Day Streak</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                    <h3 className="font-semibold mb-2">Reading Goal Progress</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span>Your Progress</span>
                      <span className="font-bold">{userStats.readingGoal}%</span>
                    </div>
                    <div className="w-full bg-purple-300 rounded-full h-3">
                      <div 
                        className="bg-white rounded-full h-3" 
                        style={{ width: `${userStats.readingGoal}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Favorite Genre</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{userStats.favoriteGenre}</span>
                        <FiHeart className="h-5 w-5 text-red-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`border-2 rounded-xl p-6 text-center transition ${
                      achievement.earned
                        ? 'border-yellow-400 bg-yellow-50 shadow-lg'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="text-3xl mb-3">{achievement.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    {achievement.earned ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <FiAward className="w-3 h-3 mr-1" />
                        Earned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Locked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reading' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reading Statistics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">Recent Reading History</h3>
                  <div className="space-y-4">
                    {readingHistory.map((book) => (
                      <div key={book.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <div>
                          <h4 className="font-semibold text-gray-900">{book.title}</h4>
                          <p className="text-sm text-gray-600">{book.author}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`h-4 w-4 ${
                                  i < book.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{book.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Reading Insights</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <FiTrendingUp className="h-6 w-6 text-blue-600 mb-2" />
                      <p className="font-semibold text-gray-900">15% More</p>
                      <p className="text-sm text-gray-600">Books read this month</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <FiClock className="h-6 w-6 text-green-600 mb-2" />
                      <p className="font-semibold text-gray-900">8.2 hrs</p>
                      <p className="text-sm text-gray-600">Average reading time/week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy & Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates about new books and features</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Reading Activity</h3>
                    <p className="text-sm text-gray-600">Show your reading activity to other members</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FiShield className="h-6 w-6 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">Data Privacy</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your personal information is secure. We never share your data with third parties without your consent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;